import { defineStore } from 'pinia'
import { supabase } from '@/supabase'

export const useGuestStore = defineStore('guest', {
    state: () => ({
        guests: [],
        currentScanResult: null,
        loading: false,
        error: null,
        isOnline: true
    }),

    actions: {
        async fetchGuests() {
            this.loading = true
            this.error = null
            try {
                const { data, error } = await supabase
                    .from('guests')
                    .select('*')
                    .order('registered_at', { ascending: false })

                if (error) throw error
                this.guests = data || []
                this.isOnline = true
                // Backup to localStorage
                localStorage.setItem('event_guests_backup', JSON.stringify(this.guests))
            } catch (err) {
                console.error('Error fetching guests:', err)
                this.error = err.message
                this.isOnline = false
                // Fallback to localStorage
                const backup = localStorage.getItem('event_guests_backup')
                if (backup) {
                    this.guests = JSON.parse(backup)
                }
            } finally {
                this.loading = false
            }
        },

        async registerGuest(firstName, lastName, email) {
            this.loading = true
            this.error = null
            try {
                const { data, error } = await supabase
                    .from('guests')
                    .insert([
                        {
                            first_name: firstName,
                            last_name: lastName,
                            email: email,
                            scanned: false
                        }
                    ])
                    .select()
                    .single()

                if (error) throw error

                // Add to local state
                this.guests.unshift(data)
                // Backup to localStorage
                localStorage.setItem('event_guests_backup', JSON.stringify(this.guests))
                return data
            } catch (err) {
                console.error('Error registering guest:', err)
                this.error = err.message
                throw err
            } finally {
                this.loading = false
            }
        },

        async checkInGuest(guestId) {
            console.log('[checkInGuest] Début, ID reçu:', guestId)
            const cleanId = guestId.trim()
            console.log('[checkInGuest] ID nettoyé:', cleanId)

            // Find guest by full ID or first 8 characters
            let guest = this.guests.find(g => g.id === cleanId || g.id.substring(0, 8) === cleanId)
            console.log('[checkInGuest] Invité trouvé localement:', guest ? `${guest.first_name} ${guest.last_name}` : 'NON')

            // If not in local state, try to fetch from database
            if (!guest) {
                console.log('[checkInGuest] Recherche dans Supabase...')
                try {
                    const { data } = await supabase
                        .from('guests')
                        .select('*')
                        .or(`id.eq.${cleanId},id.like.${cleanId}%`)
                        .single()

                    if (data) {
                        guest = data
                        console.log('[checkInGuest] Invité trouvé dans Supabase:', `${guest.first_name} ${guest.last_name}`)
                        // Add to local state if not present
                        if (!this.guests.find(g => g.id === guest.id)) {
                            this.guests.push(guest)
                        }
                    } else {
                        console.log('[checkInGuest] Aucun invité trouvé dans Supabase')
                    }
                } catch (err) {
                    console.error('[checkInGuest] Erreur Supabase:', err)
                }
            }

            if (!guest) {
                console.log('[checkInGuest] ÉCHEC: Invité non trouvé')
                this.currentScanResult = {
                    success: false,
                    message: 'Code invalide ou invité non trouvé.',
                    status: 'error'
                }
                return false
            }

            if (guest.scanned) {
                console.log('[checkInGuest] AVERTISSEMENT: Invité déjà scanné')
                this.currentScanResult = {
                    success: false,
                    fullName: `${guest.first_name} ${guest.last_name}`,
                    message: 'Cet invité a déjà été scanné !',
                    status: 'warning'
                }
                return false
            }

            // Update in database
            try {
                const { error } = await supabase
                    .from('guests')
                    .update({
                        scanned: true,
                        scanned_at: new Date().toISOString()
                    })
                    .eq('id', guest.id)

                if (error) throw error

                // Update local state
                const index = this.guests.findIndex(g => g.id === guest.id)
                if (index !== -1) {
                    this.guests[index].scanned = true
                    this.guests[index].scanned_at = new Date().toISOString()
                }

                // Backup to localStorage
                localStorage.setItem('event_guests_backup', JSON.stringify(this.guests))

                this.currentScanResult = {
                    success: true,
                    fullName: `${guest.first_name} ${guest.last_name}`,
                    message: 'Entrée confirmée. Bienvenue !',
                    status: 'success'
                }
                return true
            } catch (err) {
                console.error('Error checking in guest:', err)
                this.currentScanResult = {
                    success: false,
                    message: 'Erreur lors de la validation. Réessayez.',
                    status: 'error'
                }
                return false
            }
        },

        clearScanResult() {
            this.currentScanResult = null
        },

        // Real-time subscription
        subscribeToGuests() {
            const channel = supabase
                .channel('guests-changes')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'guests' },
                    (payload) => {
                        console.log('Change received!', payload)

                        if (payload.eventType === 'INSERT') {
                            // Add new guest to the beginning
                            this.guests.unshift(payload.new)
                        } else if (payload.eventType === 'UPDATE') {
                            // Update existing guest
                            const index = this.guests.findIndex(g => g.id === payload.new.id)
                            if (index !== -1) {
                                this.guests[index] = payload.new
                            }
                        } else if (payload.eventType === 'DELETE') {
                            // Remove deleted guest
                            const index = this.guests.findIndex(g => g.id === payload.old.id)
                            if (index !== -1) {
                                this.guests.splice(index, 1)
                            }
                        }
                    }
                )
                .subscribe()

            return channel
        }
    }
})

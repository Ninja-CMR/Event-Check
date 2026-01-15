import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'

export const useGuestStore = defineStore('guest', {
    state: () => ({
        guests: JSON.parse(localStorage.getItem('event_guests')) || [],
        currentScanResult: null,
    }),

    actions: {
        registerGuest(firstName, lastName, email) {
            const newGuest = {
                id: uuidv4(),
                firstName,
                lastName,
                email,
                scanned: false,
                registeredAt: new Date().toISOString()
            }

            this.guests.push(newGuest)
            this.saveToLocaleStorage()
            return newGuest
        },

        checkInGuest(guestId) {
            const guest = this.guests.find(g => g.id === guestId)

            if (!guest) {
                this.currentScanResult = {
                    success: false,
                    message: 'Code invalide ou invité non trouvé.',
                    status: 'error'
                }
                return false
            }

            if (guest.scanned) {
                this.currentScanResult = {
                    success: false,
                    fullName: `${guest.firstName} ${guest.lastName}`,
                    message: 'Cet invité a déjà été scanné !',
                    status: 'warning'
                }
                return false
            }

            // Success
            guest.scanned = true
            guest.scannedAt = new Date().toISOString()
            this.saveToLocaleStorage()

            this.currentScanResult = {
                success: true,
                fullName: `${guest.firstName} ${guest.lastName}`,
                message: 'Entrée confirmée. Bienvenue !',
                status: 'success'
            }
            return true
        },

        clearScanResult() {
            this.currentScanResult = null
        },

        saveToLocaleStorage() {
            localStorage.setItem('event_guests', JSON.stringify(this.guests))
        }
    }
})

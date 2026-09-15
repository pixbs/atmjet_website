import { cleanupTestUser } from './seedUser'

/** Removes the administrator `admin-user-setup.ts` created for the run (issue #343). */
export default function removeAdminUser(): void {
  cleanupTestUser()
}

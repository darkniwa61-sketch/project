import { Suspense } from 'react'
import AcceptInviteContent from './AcceptInviteContent'

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p>Loading invite...</p>
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  )
}

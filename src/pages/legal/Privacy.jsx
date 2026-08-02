import LegalLayout from "./LegalLayout.jsx";

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" subtitle="Effective Date: 23 July 2026">
      <section>
        <h2>Introduction</h2>
        <p>FitLink respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your information when you use our platform.</p>
      </section>

      <section>
        <h2>Information We Collect</h2>
        <p>We may collect:</p>
        <ul>
          <li>Full name</li>
          <li>Phone number</li>
          <li>Email address</li>
          <li>Date of birth</li>
          <li>Gender</li>
          <li>Location</li>
          <li>Emergency contact details</li>
          <li>Payment information</li>
          <li>Health or fitness information voluntarily provided</li>
          <li>Trainer, gym, academy, or wellness centre profile information</li>
        </ul>
      </section>

      <section>
        <h2>How We Use Your Information</h2>
        <p>Your information is used to:</p>
        <ul>
          <li>Create and manage your account</li>
          <li>Match clients with suitable trainers, gyms, academies, and wellness centres</li>
          <li>Process bookings and registrations</li>
          <li>Improve our platform</li>
          <li>Send booking confirmations and notifications</li>
          <li>Provide customer support</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section>
        <h2>Data Security</h2>
        <p>FitLink uses reasonable technical and organizational measures to protect your information from unauthorized access, disclosure, or misuse.</p>
      </section>

      <section>
        <h2>Sharing Information</h2>
        <p>FitLink does not sell your personal information. Information may only be shared with:</p>
        <ul>
          <li>Registered trainers</li>
          <li>Gyms</li>
          <li>Academies</li>
          <li>Wellness centres</li>
          <li>Payment service providers</li>
          <li>Government authorities where legally required</li>
        </ul>
      </section>

      <section>
        <h2>Your Rights</h2>
        <p>Users may:</p>
        <ul>
          <li>Access their information</li>
          <li>Correct inaccurate information</li>
          <li>Request deletion of their account</li>
          <li>Withdraw consent where applicable</li>
        </ul>
      </section>

      <section>
        <h2>Contact</h2>
        <p>Privacy questions: <a href="mailto:support@fitlink.co.ke" className="text-primary font-semibold">support@fitlink.co.ke</a> · <a href="tel:+254717506729" className="text-primary font-semibold">+254 717 506 729</a></p>
      </section>
    </LegalLayout>
  );
}

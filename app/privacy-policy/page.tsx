"use client"

import { useTranslation } from "@/hooks/use-translation"

export default function PrivacyPolicyPage() {
  const { t, language } = useTranslation()

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("privacy.title")}</h1>
        <p className="text-gray-600 mb-8">{t("privacy.effectiveDate")}</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <p>
            JojoLabs.am ("we," "us," or "our") operates the website{" "}
            <a href="https://www.jojolabs.am/" className="text-rose-500 hover:underline">
              https://www.jojolabs.am/
            </a>{" "}
            (the "Site"). This page informs you of our policies regarding the collection, use, and disclosure of
            personal data when you use our Site and the choices you have associated with that data.
          </p>

          <p>
            We use your data to provide and improve the service. By using the Site, you agree to the collection and use
            of information in accordance with this policy.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Information Collection and Use</h2>
          <p>
            We collect several different types of information for various purposes to provide and improve our service to
            you.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Types of Data Collected</h3>
          <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Personal Data</h4>
          <p>
            While using our Site, we may ask you to provide us with certain personally identifiable information that can
            be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but
            is not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email address</li>
            <li>First name and last name</li>
            <li>Phone number</li>
            <li>Address, State, Province, ZIP/Postal code, City</li>
            <li>Cookies and Usage Data</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Usage Data</h4>
          <p>
            We may also collect information on how the Site is accessed and used ("Usage Data"). This Usage Data may
            include information such as your computer's Internet Protocol (IP) address, browser type, browser version,
            the pages of our Site that you visit, the time and date of your visit, the time spent on those pages, and
            other diagnostic data.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Tracking & Cookies Data</h4>
          <p>
            We use cookies and similar tracking technologies to track the activity on our Site and hold certain
            information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            However, if you do not accept cookies, you may not be able to use some portions of our Site.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Use of Data</h3>
          <p>JojoLabs.am uses the collected data for various purposes:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>To provide and maintain our Service, including processing orders, payments, and shipping.</li>
            <li>To notify you about changes to our Service.</li>
            <li>To allow you to participate in interactive features of our Service when you choose to do so.</li>
            <li>To provide customer care and support.</li>
            <li>To provide analysis or valuable information so that we can improve the Service.</li>
            <li>To monitor the usage of the Service.</li>
            <li>To detect, prevent and address technical issues.</li>
            <li>To fulfill and manage your orders, process payments, and arrange for shipping.</li>
            <li>
              To communicate with you about your account, orders, and for marketing purposes (e.g., newsletters,
              promotional offers), with your consent.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Data Sharing and Disclosure</h2>
          <p>
            We do not sell or trade your Personal Data. We may share your information in the following circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>With Service Providers:</strong> We may share your data with trusted third-party service providers
              to facilitate the Service, such as payment gateways (e.g., Idram, ArcaCa), shipping partners (e.g.,
              HayPost, private courier services), and email marketing services.
            </li>
            <li>
              <strong>For Legal Obligations:</strong> We may disclose your Personal Data if we are required to do so by
              law or in a good faith belief that such action is necessary to comply with a legal obligation, protect and
              defend the rights or property of JojoLabs.am, or protect the personal safety of users of the Site or the
              public.
            </li>
            <li>
              <strong>With Your Consent:</strong> We may share your Personal Data with your consent for any other
              purpose.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Data Security</h2>
          <p>
            The security of your data is important to us. We use commercially reasonable administrative, technical, and
            physical measures to protect your Personal Data from unauthorized access, use, or disclosure. However,
            remember that no method of transmission over the Internet or method of electronic storage is 100% secure.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Your Data Protection Rights</h2>
          <p>You have certain data protection rights under Armenian law. These include:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>The right to access:</strong> You have the right to request copies of your Personal Data.
            </li>
            <li>
              <strong>The right to rectification:</strong> You have the right to request correction of any inaccurate or
              incomplete Personal Data we hold about you.
            </li>
            <li>
              <strong>The right to erasure:</strong> You have the right to request that we erase your Personal Data,
              under certain conditions.
            </li>
            <li>
              <strong>The right to restrict processing:</strong> You have the right to request that we restrict the
              processing of your Personal Data, under certain conditions.
            </li>
            <li>
              <strong>The right to object to processing:</strong> You have the right to object to our processing of your
              Personal Data, under certain conditions.
            </li>
            <li>
              <strong>The right to data portability:</strong> You have the right to request that we transfer the data
              you have provided to us to another organization, or directly to you, under certain conditions.
            </li>
          </ul>
          <p className="mt-4">
            To exercise any of these rights, please contact us at{" "}
            <a href="mailto:info@jojolabs.am" className="text-rose-500 hover:underline">
              info@jojolabs.am
            </a>
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. International Data Transfers</h2>
          <p>
            Your Personal Data may be transferred to, and maintained on, computers located outside of Armenia. If we
            transfer your Personal Data outside of Armenia, we will ensure that similar protections are in place.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Children's Privacy</h2>
          <p>
            Our Service does not address anyone under the age of 18 ("Children"). We do not knowingly collect personally
            identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware
            that your child has provided us with Personal Data, please contact us.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page and updating the "Effective Date" at the top. You are advised to review this
            Privacy Policy periodically for any changes.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us via email:{" "}
            <a href="mailto:info@jojolabs.am" className="text-rose-500 hover:underline">
              info@jojolabs.am
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8"
      >
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold">Terms and Conditions</h1>
        </div>

        <div className="prose prose-purple max-w-none">
          <p className="text-gray-600 mb-6">
            Welcome to VirtuQuick.ai! By using our application, you agree to adhere to and be bound by 
            the following terms and conditions. Please read them carefully.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-gray-700">
              These terms and conditions outline the rules for your use of VirtuQuick.ai, a fashion 
              marketplace platform operated by VirtuQuick Technologies Private Limited, based in 
              Bengaluru, India. By accessing our application, you acknowledge and accept these 
              terms in their entirety.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Usage of the App</h2>
            <p className="text-gray-700">
              To use our application, you must be at least 18 years old. By using the app, you 
              confirm that you meet this age requirement. You agree to use the application only 
              for legitimate purposes and in a manner that does not infringe on the rights of 
              others.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Account Creation</h2>
            <p className="text-gray-700">
              Access to certain features of our application may require you to create an account. 
              You agree to provide truthful, current, and complete information during the 
              registration process.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Ordering and Payments</h2>
            <p className="text-gray-700">
              When you place an order through our application, you are making an offer to purchase 
              a product under these terms and conditions. All orders depend on product availability 
              and confirmation of the order price.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Delivery</h2>
            <p className="text-gray-700">
              We provide delivery services to select locations, and delivery times may vary based 
              on product availability and your location. While we strive to deliver your order 
              within the estimated time, we cannot be held responsible for delays or failures 
              caused by factors beyond our control.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Returns and Refunds</h2>
            <p className="text-gray-700">
              We accept returns and issue refunds according to our Return and Refund Policy, 
              which is accessible through our app. To initiate a return, please contact our 
              customer service team within the specified return period.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700">
              To the maximum extent allowed by law, VirtuQuick.ai will not be liable for any indirect, 
              incidental, special, or consequential damages, nor for any loss of profits or 
              revenues, whether incurred directly or indirectly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify, defend, and hold harmless VirtuQuick.ai, along with its 
              directors, officers, employees, consultants, agents, and affiliates, from any 
              claims, liabilities, damages, or costs arising from your use of the app.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to change these terms and conditions at any time. Any updates 
              will be posted on this page and will take effect immediately upon posting.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Governing Law</h2>
            <p className="text-gray-700">
              These terms and conditions are governed by and interpreted in accordance with the 
              laws of India. Any disputes will fall under the exclusive jurisdiction of the 
              courts in Bangalore, Karnataka.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">11. Contact Information</h2>
            <p className="text-gray-700">
              If you have any inquiries about these terms and conditions, please reach out to us 
              at care@virtuquick.ai.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
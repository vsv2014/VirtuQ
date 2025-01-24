
export function About() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">About VirtuQuick.ai</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Revolutionizing the way you shop for fashion
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            At VirtuQuick.ai, we're on a mission to transform the online fashion shopping experience. 
            We believe that everyone deserves the confidence of trying before buying, bringing the 
            fitting room experience right to your doorstep.
          </p>
        </section>

        {/* Vision Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Vision</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We envision a future where the uncertainty of online fashion shopping is eliminated. 
            Through innovative technology and customer-centric services, we aim to become India's 
            most trusted fashion platform.
          </p>
        </section>

        {/* Values Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Customer First</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Every decision we make starts with our customers' needs and satisfaction.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Innovation</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We continuously strive to improve and innovate in the fashion retail space.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Sustainability</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We're committed to sustainable fashion practices and reducing our environmental impact.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Our Team</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Our diverse team of fashion enthusiasts, tech experts, and customer service professionals 
            work together to bring you the best possible shopping experience. We're united by our 
            passion for fashion and commitment to customer satisfaction.
          </p>
        </section>

        {/* Join Us Section */}
        <section className="text-center bg-purple-50 dark:bg-gray-800 p-8 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Join Our Journey</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Be part of the fashion revolution. Experience a new way to shop for clothes with 
            confidence and style.
          </p>
          <a 
            href="/contact" 
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Get in Touch
          </a>
        </section>
      </div>
    </div>
  );
}

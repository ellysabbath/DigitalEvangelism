import React from 'react';


const Contact: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold text-[#0e5488] mb-6">Contact Us</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <form className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#0e5488]"
                placeholder="Your Name"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#0e5488]"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Message</label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#0e5488]"
                rows={4}
                placeholder="Your message..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-[#0e5488] text-white rounded font-semibold hover:bg-[#002256] transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#0e5488] mb-4">Get in Touch</h3>
          <div className="space-y-3 text-gray-600">
            <p> Tanzania, East Africa</p>
            <p> info@digitalev.org</p>
            <p> +255 742 578 691</p>
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="font-semibold">Working Hours:</p>
              <p>sunday - Friday: 9:00 AM - 6:00 PM</p>
              <p>Sunday: 9:00 AM - 6:00 PM</p>
              <p>saturday: Closed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
"use client";

import { forwardRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const ContactPage = forwardRef((props, ref) => {
  const [formData, setFormData] = useState({
    topic: "",
    name: "",
    email: "",
    phone: "",
    query: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    if (
      !formData.topic.trim() ||
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.query.trim()
    ) {
      toast.error("All fields are required!");
      return false;
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      toast.error("Please enter a valid email!");
      return false;
    }

    if (!/^\+?\d{10,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      toast.error("Please enter a valid phone number!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (process.env.NEXT_PUBLIC_BACKEND_ENABLED === "false") {
      toast.info("Contact submissions are coming soon.");
      return;
    }
    if (!validate()) return;

    try {
      setSubmitting(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/contact/create`,
        formData,
      );

      if (response.status === 201) {
        toast.success("Your query has been submitted successfully!");
        setFormData({ topic: "", name: "", email: "", phone: "", query: "" });
      } else {
        toast.error("Something went wrong. Please try again later.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      ref={ref}
      className="bg-black px-4 py-20 text-white sm:px-6 lg:px-8"
    >
      <ToastContainer />
      <div className="mx-auto w-full max-w-5xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="poppins text-xs uppercase tracking-[0.28em] text-white/50">
            Get in touch
          </p>
          <h1 className="mt-3 text-4xl tracking-wide pp-fragment sm:text-5xl">
            CONTACT US
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm font-light leading-7 text-white/60 sm:text-base">
            For all Tathva-related enquiries, our team is just a message away.
          </p>
        </div>

        <div className="mt-12 border-y border-white/15 py-8 sm:py-10">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2"
          >
            <div className="border-b border-white/25 pb-3">
              <label
                htmlFor="topic"
                className="poppins block text-[11px] uppercase tracking-[0.2em] text-white/55"
              >
                Topic
              </label>
              <input
                id="topic"
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                placeholder="ENTER TOPIC"
                className="mt-3 w-full bg-transparent text-base text-white placeholder-white/25 pp-fragment focus:outline-none"
              />
            </div>

            <div className="border-b border-white/25 pb-3">
              <label
                htmlFor="name"
                className="poppins block text-[11px] uppercase tracking-[0.2em] text-white/55"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="FULL NAME"
                className="mt-3 w-full bg-transparent text-base text-white placeholder-white/25 pp-fragment focus:outline-none"
              />
            </div>

            <div className="border-b border-white/25 pb-3">
              <label
                htmlFor="email"
                className="poppins block text-[11px] uppercase tracking-[0.2em] text-white/55"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="yourname@example.com"
                className="mt-3 w-full bg-transparent text-base text-white placeholder-white/25 pp-fragment focus:outline-none"
              />
            </div>

            <div className="border-b border-white/25 pb-3">
              <label
                htmlFor="phone"
                className="poppins block text-[11px] uppercase tracking-[0.2em] text-white/55"
              >
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 00000 00000"
                className="mt-3 w-full bg-transparent text-base text-white placeholder-white/25 pp-fragment focus:outline-none"
              />
            </div>

            <div className="border-b border-white/25 pb-3 md:col-span-2">
              <label
                htmlFor="query"
                className="poppins block text-[11px] uppercase tracking-[0.2em] text-white/55"
              >
                Query
              </label>
              <textarea
                id="query"
                name="query"
                value={formData.query}
                onChange={handleInputChange}
                placeholder="ENTER DETAILS"
                rows={4}
                className="mt-3 w-full resize-none bg-transparent text-base leading-7 text-white placeholder-white/25 pp-fragment focus:outline-none"
              />
            </div>

            <div className="flex justify-center pt-2 md:col-span-2">
              <button
                type="submit"
                className="group flex items-center gap-3 border border-white/25 px-7 py-3 text-lg text-white pp-fragment transition-colors duration-200 hover:border-white hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50 sm:text-xl"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
                <span className="transform transition-transform duration-300 -rotate-45 group-hover:rotate-0">
                  ➤
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
});

export default ContactPage;

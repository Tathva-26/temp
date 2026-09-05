"use client";
import Footer from "@/components/Footer";

import { useState,forwardRef } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

const { NEXT_PUBLIC_API } = process.env;

const ContactPage = forwardRef((props, ref) => {
  const [formData, setFormData] = useState({
    topic: "",
    name: "",
    email: "",
    phone: "",
    query: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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
    if (validate()) {
      try {
        setSubmitting(true);
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API}/api/contact/create`, formData);
        if (response.status === 201) {
          toast.success("Your query has been submitted successfully!");
          setFormData({
            topic: "",
            name: "",
            email: "",
            phone: "",
            query: "",
          });
          setErrors({});
        } else {
          toast.error("Something went wrong. Please try again later.");
        }
        setSubmitting(false);
      }
      catch (error) {
        console.log(error);
        toast.error("Something went wrong. Please try again later.");
      }
    }
  };


  return (
    <div ref={ref} className=" bg-black  items-center justify-center ">
      <ToastContainer />
      <div className="w-full h-fit">
        <div className="relative px-6 sm:px-8 sm:py-8">
          <div className="flex justify-between flex-col  text-white">
            <h1 className="text-3xl sm:text-4xl tracking-wide pp-fragment text-white">
              CONTACT US
            </h1>
          <p className="mt-4 text-gray-300 text-sm sm:text-base font-light">
      For all Tathva-related enquiries, our team is just a message away.
    </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-8 ">

          <div className="border-t border-white/20 pt-2 pb-8 flex flex-col md:flex-row justify-between w-full">
            <label className="block poppins uppercase font-medium md:w-[50%] text-white">
              Topic
            </label>
            <div className="md:w-[50%]">
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleInputChange}
                placeholder="ENTER TOPIC"
                className="w-full text-lg sm:text-2xl md:text-3xl text-white placeholder-gray-500 pp-fragment bg-transparent text-right md:text-left border-0 focus:outline-none focus:ring-0"
              />
              {errors.topic && (
                <p className="text-red-500 text-sm mt-1">{errors.topic}</p>
              )}
            </div>
          </div>

          <div className="border-t border-white/20 pt-2 pb-8 flex flex-col md:flex-row justify-between w-full">
            <label className="block poppins uppercase md:w-[50%] t text-white ">
              Name
            </label>
            <div className="md:w-[50%]">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="FULL NAME"
                className="w-full text-lg sm:text-2xl md:text-3xl text-white placeholder-gray-500 pp-fragment bg-transparent text-right md:text-left border-0 focus:outline-none focus:ring-0"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          <div className="border-t border-white/20 pt-2 pb-8 flex flex-col md:flex-row justify-between w-full">
            <label className="block poppins uppercase md:w-[50%] text-white font-medium">
              Email
            </label>
            <div className="md:w-[50%]">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="yourname@example.com"
                className="w-full text-lg sm:text-2xl md:text-3xl text-white placeholder-gray-500 pp-fragment bg-transparent text-right md:text-left border-0 focus:outline-none focus:ring-0"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="border-t border-white/20 pt-2 pb-8 flex flex-col md:flex-row justify-between w-full">
            <label className="block poppins uppercase md:w-[50%] text-white font-medium">
              Phone
            </label>
            <div className="md:w-[50%]">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 00000 00000"
                className="w-full text-lg sm:text-2xl md:text-3xl text-white  placeholder-gray-500 pp-fragment bg-transparent text-right md:text-left border-0 focus:outline-none focus:ring-0"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="border-t border-white/20 pt-2 flex flex-col md:flex-row justify-between w-full">
            <label className="block poppins uppercase text-white font-medium">
              Query
            </label>
            <div className="md:w-[50%]">
              <textarea
                name="query"
                value={formData.query}
                onChange={handleInputChange}
                placeholder="ENTER DETAILS"
                rows={4}
                className="w-full text-lg sm:text-2xl md:text-3xl mt-6 sm:mt-0 text-white text-right md:text-left pp-fragment placeholder-gray-500 border-0 focus:outline-none focus:ring-0 resize-none"
              />
              {errors.query && (
                <p className="text-red-500 text-sm mt-1">{errors.query}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center mt-2 md:-mt-10  gap-2 text-xl  sm:text-3xl text-white bg-transparent pp-fragment border-white/20 transition-colors duration-200 group"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
              <span className="-mt-2 transform transition-transform duration-300 -rotate-45 group-hover:rotate-0">
                ➤
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default ContactPage;

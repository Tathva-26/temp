import React, { useState } from "react";
import { ChevronRight, Phone, GraduationCap, Users } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: "",
    college: "",
    district: "",
    referredById: "",
  });

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData({ ...formData, phone: value });
  };

  const handleNext = () => {
    if (step === 1 && formData.phone.length === 10) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      handleSubmit();
    }
  };

  const handleSkip = () => {
    if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      handleSubmit();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const token = localStorage.getItem("jwt");
    if (!token) {
      alert("Unauthorized: No JWT token found");
      return;
    }

    const dataToSend = { ...formData };

    // If referral field is empty, remove it from payload
    if (!dataToSend.referredById || dataToSend.referredById.trim() === "") {
      delete dataToSend.referredById;
    }

    try {
      const res = await axios.put(
        "https://api.tathva.org/api/users",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      router.push("/profile");
    } catch (error) {
      toast.error(error.response || error);
    }
  };

  const isPhoneValid = formData.phone.length === 10;
  const canProceedStep2 = formData.college.trim() && formData.district.trim();

  return (
    <div className="w-full max-w-lg px-5">
      <div className="">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-3">
            {[1, 2, 3].map((i) => (
              <React.Fragment key={i}>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${
                    step >= i
                      ? "bg-gradient-to-br from-gray-800 to-black text-white scale-110"
                      : "bg-white text-gray-400 border-2 border-gray-300"
                  }`}
                >
                  <span className="text-sm font-bold">{i}</span>
                </div>
                {i < 3 && (
                  <div
                    className={`w-16 h-1 rounded-full transition-all duration-500 ${
                      step > i
                        ? "bg-gradient-to-r from-gray-700 to-gray-900"
                        : "bg-gray-300"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-300 p-8 backdrop-blur-sm bg-opacity-95">
          {/* Step 1: Phone */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <Phone className="w-5 h-5 text-white " />
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">
                  Welcome
                </h2>
                <p className="text-gray-600">
                  Enter your phone number to continue.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="10-digit phone number"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-gray-800 focus:ring-4 focus:ring-gray-200 transition-all text-gray-800 placeholder-gray-400 shadow-sm"
                />
                {formData.phone && !isPhoneValid && (
                  <p className="text-xs text-gray-500 pl-2">
                    Enter a valid 10-digit number
                  </p>
                )}
              </div>

              <button
                onClick={handleNext}
                disabled={!isPhoneValid}
                className="w-full bg-gradient-to-r from-gray-800 to-black text-white py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:border border-gray-300 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <span>Continue</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: College & District */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <GraduationCap className="w-9 h-9 text-white" />
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">
                  Your Education
                </h2>
                <p className="text-gray-600">Tell us about your college</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    College Name
                  </label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) =>
                      setFormData({ ...formData, college: e.target.value })
                    }
                    placeholder="Enter your college"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-gray-800 focus:ring-4 focus:ring-gray-200 transition-all text-gray-800 placeholder-gray-400 shadow-sm"
                  />
                </div>

                {/* <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={formData.branch}
                    onChange={(e) =>
                      setFormData({ ...formData, branch: e.target.value })
                    }
                    placeholder="Enter your semester"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-gray-800 focus:ring-4 focus:ring-gray-200 transition-all text-gray-800 placeholder-gray-400 shadow-sm"
                  />
                </div> */}

                {/* <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: e.target.value })
                    }
                    placeholder="Enter your semester"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-gray-800 focus:ring-4 focus:ring-gray-200 transition-all text-gray-800 placeholder-gray-400 shadow-sm"
                  />
                </div> */}

                {/* <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Year
                  </label>
                  <input
                    type="text"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                    placeholder="Enter your year"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-gray-800 focus:ring-4 focus:ring-gray-200 transition-all text-gray-800 placeholder-gray-400 shadow-sm"
                  />
                </div> */}

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    District
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    placeholder="Enter your district"
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-gray-800 focus:ring-4 focus:ring-gray-200 transition-all text-gray-800 placeholder-gray-400 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                {/* <button
                  onClick={handleSkip}
                  className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg transition-all duration-300"
                >
                  Skip
                </button> */}
                <button
                  onClick={handleNext}
                  disabled={!canProceedStep2}
                  className="flex-1 bg-gradient-to-r from-gray-800 to-black text-white py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:border border-gray-300 hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Referral ID */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <Users className="w-9 h-9 text-white" />
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">
                  Referral Code
                </h2>
                <p className="text-gray-600">Do you have a referral code?</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Referral ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.referredById}
                  onChange={(e) =>
                    setFormData({ ...formData, referredById: e.target.value })
                  }
                  placeholder="Enter referral code"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-gray-800 focus:ring-4 focus:ring-gray-200 transition-all text-gray-800 placeholder-gray-400 shadow-sm"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSkip}
                  className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg transition-all duration-300"
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-gray-800 to-black text-white py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:border border-gray-300 hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  <span>Complete</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Footer text */}
          <p className="text-center text-xs text-gray-500 mt-6">
            {step === 2 || step === 3
              ? ""
              : "Don’t worry — we’ll only use it to send your tickets and event updates, and maybe a friendly reminder before the fun begins!"}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

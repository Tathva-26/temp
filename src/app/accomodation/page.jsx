'use client';
import React, {useState, useMemo, useEffect} from "react";
import {
  ChevronRight,
  ChevronLeft,
  Bed,
  UtensilsCrossed,
  User,
  Users,
  CheckCircle,
  Plus,
  Minus,
    Home,
} from "lucide-react";
import {useRouter} from "next/navigation";
import { redirect } from 'next/navigation';
import jwtRequired from "@/axios/jwtRequired";

// A dummy function to simulate an API call
const postAccommodationDetails = async (data) => {
  const apiEndpoint = "https://api.tathva.org/api/booking/create"; // Sample backend link
  console.log("Submitting accommodation data to:", apiEndpoint);
  console.log("Payload:", data);

  const res = await jwtRequired.post(apiEndpoint, data);
  console.log(res);
  return res.data;
};

const initialFoodState = {
  24: { veg: 0, nonVeg: 0 },
  25: { veg: 0, nonVeg: 0 },
  26: { veg: 0, nonVeg: 0 },
};

const accommodationPricing = [
    {
        type: "Dormitory",
        prices: { "1 Day": 180, "2 Day": 310, "3 Day": 440, "4 Day": 620 },
        icon: <Users className="w-6 h-6 text-gray-600"/>
    },
    {
        type: "3 Sharing Room",
        prices: { "1 Day": 900, "2 Day": 1650, "3 Day": 2400, "4 Day": 3150 },
        icon: <User className="w-6 h-6 text-gray-600"/>
    },
    {
        type: "4 Sharing Room",
        prices: { "1 Day": 1000, "2 Day": 1800, "3 Day": 2600, "4 Day": 3400 },
        icon: <Users className="w-6 h-6 text-gray-600"/>
    }
];

export default function AccommodationRegistration() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    gender: "", // 'male' or 'female'
    roomType: "", // 'Dorm Room', '4 Sharing Room', '3 Sharing Room'
    foodDetails: initialFoodState,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

    // --- NEW: Price Calculation Logic ---
    const priceDetails = useMemo(() => {
        const MEAL_PRICE = 150;
        const PLATFORM_FEE_RATE = 0.02; // 2%
        const GST_RATE = 0.18; // 18%

        let accommodationCost = 0;
        let numberOfDays = 0;

        // 1. Calculate Accommodation Cost
        if (formData.startDate && formData.endDate && formData.roomType) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            numberOfDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

            const durationKey = `${numberOfDays} Day`;

            const roomTypeMapping = {
                "Dorm Room": "Dormitory",
                "3 Sharing Room": "3 Sharing Room",
                "4 Sharing Room": "4 Sharing Room",
            };
            const mappedRoomType = roomTypeMapping[formData.roomType];
            const accommodationInfo = accommodationPricing.find(p => p.type === mappedRoomType);

            if (accommodationInfo && accommodationInfo.prices[durationKey]) {
                accommodationCost = accommodationInfo.prices[durationKey];
            }
        }

        // 2. Calculate Food Cost
        const totalMeals = Object.values(formData.foodDetails).reduce(
            (acc, day) => acc + day.veg + day.nonVeg, 0
        );
        const foodCost = totalMeals * MEAL_PRICE;

        // 3. Calculate Total and Fees
        const subtotal = accommodationCost + foodCost;
        const platformFee = subtotal * PLATFORM_FEE_RATE;
        const gst = platformFee * GST_RATE;
        const grandTotal = subtotal + platformFee + gst;

        return {
            accommodationCost,
            foodCost,
            subtotal,
            platformFee,
            gst,
            grandTotal,
            numberOfDays,
            totalMeals,
        };
    }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };

    // If start date changes, clear end date if it's no longer valid
    if (name === "startDate" && newFormData.endDate && newFormData.endDate < value) {
        newFormData.endDate = "";
    }
    
    setFormData(newFormData);
  };

  const handleGenderChange = (gender) => {
    setFormData((prev) => ({ ...prev, gender, roomType: "" })); // Reset room type
  };

  const handleFoodCountChange = (date, type, change) => {
    setFormData((prev) => {
      const currentCount = prev.foodDetails[date][type];
      const newCount = Math.max(0, currentCount + change); // Ensure count doesn't go below 0
      return {
        ...prev,
        foodDetails: {
          ...prev.foodDetails,
          [date]: {
            ...prev.foodDetails[date],
            [type]: newCount,
          },
        },
      };
    });
  };


  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => {
    setSubmitError(null); // Clear error on navigating back
    setStep((prev) => prev - 1);
  }
  
  const handleSkipFood = () => {
    setFormData(prev => ({ ...prev, foodDetails: initialFoodState }));
    setStep(4); // Skip to checkout
  };

  const transformDataForAPI = (data) => {
    const payload = {
      eventId: 1589, // As per example
      // ticketId: 2274, // As per example
      gender: data.gender.toUpperCase(),
      startDate: data.startDate,
      endDate: data.endDate
    };
  
    // Map roomType to backend values
    const roomMapping = {
      "Dorm Room": "DORM",
      "4 Sharing Room": "ROOM4",
      "3 Sharing Room": "ROOM3",
    };
    payload.room = roomMapping[data.roomType];
    if (payload.room === "DORM") payload.room = (payload.gender === "MALE") ? "DORMB" : "DORMG";
  
    // Flatten foodDetails
    Object.entries(data.foodDetails).forEach(([day, counts]) => {
      if (counts.veg > 0) {
        payload[`foodDay${day}Veg`] = counts.veg;
      }
      if (counts.nonVeg > 0) {
        payload[`foodDay${day}NonVeg`] = counts.nonVeg;
      }
    });
  
    return payload;
  };

  const handleSubmit = async () => {

    setIsSubmitting(true);
    setSubmitError(null);
    const apiPayload = transformDataForAPI(formData);

      try {
          const res = await postAccommodationDetails(apiPayload);
          console.log(res);

          if (res?.redir_url) {
              window.open(res.redir_url, '_self');
          } else {
              setIsSubmitting(false);
          }


      } catch (error) {
          console.error("Submission failed:", error);
          setSubmitError(error.message || "An unexpected error occurred.");
          setIsSubmitting(false);
      }
  };

  const roomOptions = useMemo(() => {
    if (formData.gender === "male") return ["Dorm Room", "4 Sharing Room"];
    if (formData.gender === "female") return ["Dorm Room", "3 Sharing Room"];
    return [];
  }, [formData.gender]);

  const isStep2Valid =
    formData.startDate &&
    formData.endDate &&
    formData.endDate >= formData.startDate &&
    formData.gender &&
    formData.roomType;
    
  const isStep4Valid = useMemo(() => {
    return Object.values(formData.foodDetails).some(day => day.veg > 0 || day.nonVeg > 0);
  }, [formData.foodDetails]);


  // --- Render Functions ---

  const renderInitialView = () => (
      <div className="text-center p-4 sm:p-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent mb-2">
              Food & Accommodation
          </h1>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Review our affordable stay and food options for Tathva '25.
          </p>

          <div className="space-y-6 text-left mb-8">
              <h3 className="text-2xl font-bold text-gray-800 text-center">Stay Packages</h3>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                      <span className="font-semibold">Note:</span> Dormitory prices are per person. Shared room prices are per room.
                  </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {accommodationPricing.map(pkg => (
                      <div key={pkg.type} className="bg-gray-50/80 p-6 rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                          <h4 className="text-xl font-semibold text-gray-900 mb-4">{pkg.type}</h4>
                          <ul className="space-y-2 text-gray-700">
                              {Object.entries(pkg.prices).map(([days, price]) => (
                                  <li key={days} className="flex justify-between items-center">
                                      <span>{days}</span>
                                      <span className="font-bold text-gray-800">₹{price}</span>
                                  </li>
                              ))}
                          </ul>
                      </div>
                  ))}
              </div>

              <div className="bg-gradient-to-r from-gray-700 to-black p-6 rounded-2xl text-white shadow-xl">
                  <div className="flex items-center justify-between">
                      <div>
                          <h4 className="text-xl font-semibold mb-1">Food Combos</h4>
                          <p className="text-gray-200 text-sm">Breakfast + Lunch (Veg/Non-Veg)</p>
                      </div>
                      <div className="text-2xl font-bold bg-white text-gray-800 rounded-lg px-4 py-2">
                          ₹150
                      </div>
                  </div>
              </div>
          </div>

          <button
              onClick={handleClick1}
              className="w-full max-w-md mx-auto bg-gradient-to-r from-gray-800 to-black text-white py-4 px-6 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:scale-105 transition-all duration-300 shadow-lg"
          >
              <span>{isLoggedIn ? "Register for Accommodation": "Login to Register"}</span>

              <ChevronRight className="w-5 h-5" />
          </button>
      </div>
  );

    const renderStep2 = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <Bed className="w-9 h-9 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">
                    Stay Details
                </h2>
                <p className="text-gray-600">Select your dates and room preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Start Date</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} min="2025-10-23" max="2025-10-26" className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-gray-800 focus:ring-4 focus:ring-gray-200 transition-all text-gray-800 placeholder-gray-400 shadow-sm" />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">End Date</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} min={formData.startDate || "2025-10-23"} max="2025-10-26" disabled={!formData.startDate} className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-gray-800 focus:ring-4 focus:ring-gray-200 transition-all text-gray-800 placeholder-gray-400 shadow-sm disabled:bg-gray-100" />
                </div>
            </div>

            {/* Added Instruction */}
            <p className="text-xs text-center text-gray-500 -mt-2">
                For a single-day booking, please select the same start and end date.
            </p>

            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Gender</label>
                <div className="flex gap-3">{["male", "female"].map((gender) => (
                    <button key={gender} onClick={() => handleGenderChange(gender)} className={`flex-1 py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-sm border-2 ${formData.gender === gender ? "bg-gray-800 text-white border-gray-800 scale-105" : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"}`}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</button>
                ))}</div>
            </div>

            {roomOptions.length > 0 && (
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Room Type</label>
                    <div className="flex gap-3">{roomOptions.map((room) => (
                        <button key={room} onClick={() => setFormData((prev) => ({ ...prev, roomType: room }))} className={`flex-1 py-3.5 rounded-2xl font-semibold transition-all duration-300 shadow-sm border-2 ${formData.roomType === room ? "bg-gray-800 text-white border-gray-800 scale-105" : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"}`}>{room}</button>
                    ))}</div>
                </div>
            )}

            <div className="flex space-x-3 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg transition-all duration-300"><ChevronLeft className="w-5 h-5"/><span>Back</span></button>
                <button onClick={handleNext} disabled={!isStep2Valid} className="flex-1 bg-gradient-to-r from-gray-800 to-black text-white py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300 shadow-lg"><span>Continue</span><ChevronRight className="w-5 h-5"/></button>
            </div>
        </div>
    );

  const renderStep4 = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"><UtensilsCrossed className="w-9 h-9 text-white" /></div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">Food Options</h2>
            <p className="text-gray-600">Add veg or non-veg meals for each day.</p><p className="text-xs text-gray-500 pt-1">Note: Only breakfast and lunch will be provided.</p>
        </div>
        
        <div className="space-y-4">
            {Object.keys(formData.foodDetails).map(date => (
                <div key={date} className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3 text-lg">October {date}th</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Veg Counter */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Veg Meals</label>
                            <div className="flex items-center gap-3">
                                <button onClick={() => handleFoodCountChange(date, 'veg', -1)} className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 text-gray-700 flex items-center justify-center hover:bg-gray-100 transition-all shadow-sm"><Minus className="w-4 h-4" /></button>
                                <span className="text-lg font-bold text-gray-800 w-8 text-center">{formData.foodDetails[date].veg}</span>
                                <button onClick={() => handleFoodCountChange(date, 'veg', 1)} className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 text-gray-700 flex items-center justify-center hover:bg-gray-100 transition-all shadow-sm"><Plus className="w-4 h-4" /></button>
                            </div>
                        </div>
                        {/* Non-Veg Counter */}
                        <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-700">Non-Veg Meals</label>
                             <div className="flex items-center gap-3">
                                <button onClick={() => handleFoodCountChange(date, 'nonVeg', -1)} className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 text-gray-700 flex items-center justify-center hover:bg-gray-100 transition-all shadow-sm"><Minus className="w-4 h-4" /></button>
                                <span className="text-lg font-bold text-gray-800 w-8 text-center">{formData.foodDetails[date].nonVeg}</span>
                                <button onClick={() => handleFoodCountChange(date, 'nonVeg', 1)} className="w-8 h-8 rounded-full bg-white border-2 border-gray-300 text-gray-700 flex items-center justify-center hover:bg-gray-100 transition-all shadow-sm"><Plus className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="flex space-x-3 pt-2">
            <button onClick={handleBack} className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg transition-all duration-300"><ChevronLeft className="w-5 h-5"/><span>Back</span></button>
            <button onClick={handleSkipFood} className="flex-[0.8] bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg transition-all duration-300">Skip</button>
            <button onClick={handleNext} disabled={!isStep4Valid} className="flex-1 bg-gradient-to-r from-gray-800 to-black text-white py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300 shadow-lg"><span>Next</span><ChevronRight className="w-5 h-5" /></button>
        </div>
    </div>
  );

    const renderStep5 = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"><CheckCircle className="w-9 h-9 text-white" /></div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">Confirm Details</h2><p className="text-gray-600">Please review your selections before checkout.</p>
            </div>
            <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                {/* --- Booking Summary --- */}
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center"><span className="font-semibold text-gray-600">Dates:</span><span className="font-bold text-gray-800">{formData.startDate} to {formData.endDate}</span></div><hr/>
                    <div className="flex justify-between items-center"><span className="font-semibold text-gray-600">Room:</span><span className="font-bold text-gray-800">{formData.roomType} ({formData.gender})</span></div>

                    {isStep4Valid && Object.entries(formData.foodDetails).map(([date, counts]) => {
                        if (counts.veg > 0 || counts.nonVeg > 0) {
                            return (
                                <React.Fragment key={date}>
                                    <hr />
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-600">Food (Oct {date}):</span>
                                        <span className="font-bold text-gray-800 text-right">
                                        {counts.veg > 0 && `${counts.veg} Veg`}
                                            {counts.veg > 0 && counts.nonVeg > 0 && ', '}
                                            {counts.nonVeg > 0 && `${counts.nonVeg} Non-Veg`}
                                    </span>
                                    </div>
                                </React.Fragment>
                            );
                        }
                        return null;
                    })}
                </div>

                {/* --- Price Summary --- */}
                <hr />
                <div className="space-y-2 text-sm">
                    <h4 className="font-semibold text-gray-800 text-base mb-2">Price Summary</h4>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Accommodation ({priceDetails.numberOfDays} Day{priceDetails.numberOfDays !== 1 ? 's' : ''})</span>
                        <span className="font-medium text-gray-800">₹{priceDetails.accommodationCost.toFixed(2)}</span>
                    </div>
                    {priceDetails.foodCost > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Food ({priceDetails.totalMeals} Meal{priceDetails.totalMeals !== 1 ? 's' : ''})</span>
                            <span className="font-medium text-gray-800">₹{priceDetails.foodCost.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center font-semibold pt-1">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900">₹{priceDetails.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Platform Fee (2%)</span>
                        <span className="font-medium text-gray-600">+ ₹{priceDetails.platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">GST on Fee (18%)</span>
                        <span className="font-medium text-gray-600">+ ₹{priceDetails.gst.toFixed(2)}</span>
                    </div>
                </div>

                <hr />
                <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-gray-800 text-lg">Grand Total</span>
                    <span className="font-bold text-gray-900 text-lg">₹{priceDetails.grandTotal.toFixed(2)}</span>
                </div>
            </div>

            {submitError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{submitError}</p>
                </div>
            )}

            <div className="flex space-x-3 pt-2">
                <button onClick={handleBack} className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg transition-all duration-300"><ChevronLeft className="w-5 h-5"/><span>Back</span></button>
                <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-gray-800 to-black text-white py-4 rounded-2xl font-semibold flex items-center justify-center space-x-2 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed hover:scale-105 transition-all duration-300 shadow-lg"><span>{isSubmitting ? 'Processing...' : 'Checkout'}</span>{!isSubmitting && <ChevronRight className="w-5 h-5" />}</button>
            </div>
        </div>
    );

  const renderStep6 = () => (
    <div className="text-center p-8 animate-fade-in space-y-4">
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto" /><h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">Registration Complete!</h1><p className="text-gray-600 max-w-sm mx-auto">Thank you! Your accommodation has been booked. You will receive a confirmation email shortly.</p>
    </div>
  );

  const progressSteps = [
    { id: 2, icon: Bed, name: "Stay" },
    { id: 3, icon: UtensilsCrossed, name: "Food" },
    { id: 4, icon: CheckCircle, name: "Checkout" },
  ];

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        setIsLoggedIn(!!token);
    }, []);

    const handleClick1 = () => {
        if (!isLoggedIn) {
            router.push("/");
            return;
        }
        setStep(2);
    };


    return (
    <div className="w-full max-w-xl px-5 mx-auto my-10 flex justify-center">
        <button
            onClick={() => router.push('/')}
            className="fixed top-5 right-5 z-50 p-3 bg-white border-2 border-gray-200 rounded-full shadow-lg hover:bg-gray-100 hover:scale-110 transition-all duration-300"
            aria-label="Go to Home"
        >
            <Home className="w-6 h-6 text-gray-800" />
        </button>
      <div>
        {step > 1 && step < 5 && (
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-2">
              {progressSteps.map((pStep, index) => (
                <React.Fragment key={pStep.id}>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${ step >= pStep.id ? "bg-gradient-to-br from-gray-800 to-black text-white scale-110" : "bg-white text-gray-400 border-2 border-gray-300" }`}><pStep.icon className="w-5 h-5" /></div>
                    <span className={`text-xs font-semibold ${step >= pStep.id ? 'text-gray-800' : 'text-gray-400'}`}>{pStep.name}</span>
                  </div>
                  {index < progressSteps.length - 1 && (<div className={`w-16 h-1 mt-[-24px] rounded-full transition-all duration-500 ${ step > pStep.id ? "bg-gradient-to-r from-gray-700 to-gray-900" : "bg-gray-300" }`}/>)}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
        <div className="bg-white xl:w-[50vw] rounded-3xl border border-gray-200 shadow-xl p-8 backdrop-blur-sm bg-opacity-95">
          {step === 1 && renderInitialView()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep4()}
          {step === 4 && renderStep5()}
          {step === 5 && renderStep6()}
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div>
  );
}


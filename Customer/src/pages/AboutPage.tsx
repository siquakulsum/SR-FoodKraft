import React, { useState } from 'react';
import { Award, Users, Clock, Heart, Star, CheckCircle, Quote, Calendar, Leaf, Shield, Trophy, MapPin, Phone, Mail, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AboutPage() {
  // Gallery state
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  const achievements = [
    { icon: Users, number: '5000+', label: 'Happy Customers' },
    { icon: Award, number: '500+', label: 'Events Catered' },
    { icon: Clock, number: '10+', label: 'Years Experience' },
    { icon: Star, number: '4.9', label: 'Average Rating' },
  ];

  // Team members data
  const teamMembers = [
    {
      name: "Suresh Kumar",
      role: "Founder & Head Chef",
      image: "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg",
      bio: "With 15+ years in culinary arts, Suresh brings traditional Indian flavors to life with modern presentation techniques. His passion for authentic cuisine drives our kitchen's excellence.",
      specialties: ["Traditional Indian Cuisine", "Menu Development", "Kitchen Management"]
    },
    {
      name: "Radha Sharma",
      role: "Co-Founder & Operations Director",
      image: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg",
      bio: "Radha oversees all operations with meticulous attention to detail. Her expertise in event management ensures every celebration runs smoothly from planning to execution.",
      specialties: ["Event Management", "Customer Relations", "Quality Control"]
    },
    {
      name: "Arjun Patel",
      role: "Executive Chef",
      image: "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg",
      bio: "Arjun leads our kitchen team with innovative recipes and flawless execution. His expertise in fusion cuisine has earned us numerous accolades.",
      specialties: ["Fusion Cuisine", "Recipe Innovation", "Team Leadership"]
    }
  ];

  // Customer testimonials
  const testimonials = [
    {
      name: "Priya & Rajesh",
      event: "Wedding Reception",
      rating: 5,
      text: "SR FoodKraft made our wedding absolutely perfect! The food was exceptional, service was impeccable, and our guests are still talking about it months later.",
      image: "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg",
      date: "November 2024"
    },
    {
      name: "TechCorp Solutions",
      event: "Annual Corporate Gala",
      rating: 5,
      text: "Professional, punctual, and absolutely delicious! SR FoodKraft handled our 200-person corporate event flawlessly. Highly recommended for business events.",
      image: "https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg",
      date: "October 2024"
    },
    {
      name: "The Sharma Family",
      event: "Golden Anniversary",
      rating: 5,
      text: "Thank you for making our 50th anniversary celebration so special. The traditional dishes brought back wonderful memories, and the presentation was beautiful.",
      image: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg",
      date: "September 2024"
    }
  ];

  // Awards and certifications
  const awards = [
    {
      title: "Best Catering Service 2023",
      organization: "Local Business Excellence Awards",
      year: "2023",
      icon: Trophy
    },
    {
      title: "Food Safety Excellence Certificate",
      organization: "Health Department",
      year: "2023",
      icon: Shield
    },
    {
      title: "Customer Choice Award",
      organization: "Wedding Planning Association",
      year: "2022",
      icon: Award
    },
    {
      title: "Sustainable Business Practice",
      organization: "Green Business Council",
      year: "2022",
      icon: Leaf
    }
  ];

  // Company milestones
  const milestones = [
    { year: "2014", event: "SR FoodKraft Founded", description: "Started as a small family business with a passion for authentic cuisine" },
    { year: "2016", event: "First 50 Events Milestone", description: "Reached our first major milestone with growing customer base" },
    { year: "2018", event: "Kitchen Expansion", description: "Expanded our kitchen facilities to handle larger events" },
    { year: "2020", event: "Digital Transformation", description: "Launched online ordering and digital menu systems" },
    { year: "2022", event: "Award Recognition", description: "Received multiple awards for excellence in catering services" },
    { year: "2023", event: "500+ Events Celebrated", description: "Achieved major milestone of 500+ successful events" },
    { year: "2024", event: "Community Outreach", description: "Launched sustainability initiatives and community programs" }
  ];

  // Event gallery
  const eventGallery = [
    {
      image: "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg",
      title: "Elegant Wedding Reception",
      category: "Wedding",
      description: "Beautiful outdoor wedding with traditional and modern cuisine"
    },
    {
      image: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg",
      title: "Corporate Annual Gala",
      category: "Corporate",
      description: "Professional catering for 200+ corporate executives"
    },
    {
      image: "https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg",
      title: "Birthday Celebration",
      category: "Private Party",
      description: "Intimate family celebration with customized menu"
    },
    {
      image: "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg",
      title: "Anniversary Dinner",
      category: "Private Party",
      description: "Golden anniversary celebration with traditional dishes"
    },
    {
      image: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg",
      title: "Conference Catering",
      category: "Corporate",
      description: "Multi-day conference with diverse menu options"
    },
    {
      image: "https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg",
      title: "Festival Celebration",
      category: "Community",
      description: "Community festival with authentic regional cuisine"
    }
  ];

  // Sustainability initiatives
  const sustainabilityInitiatives = [
    {
      title: "Eco-Friendly Packaging",
      description: "Using biodegradable and recyclable packaging materials for all our deliveries",
      icon: Leaf
    },
    {
      title: "Local Sourcing",
      description: "Supporting local farmers and suppliers within 50km radius for fresh ingredients",
      icon: MapPin
    },
    {
      title: "Zero Food Waste",
      description: "Implementing smart portion planning and donating excess food to local charities",
      icon: Shield
    },
    {
      title: "Community Outreach",
      description: "Regular food drives and community meal programs for underprivileged families",
      icon: Heart
    }
  ];

  // Gallery navigation functions
  const nextGalleryImage = () => {
    setCurrentGalleryIndex((prev) => (prev + 1) % eventGallery.length);
  };

  const prevGalleryImage = () => {
    setCurrentGalleryIndex((prev) => (prev - 1 + eventGallery.length) % eventGallery.length);
  };

  const services = [
    {
      title: 'Wedding Catering',
      description: 'Make your special day memorable with our exquisite wedding catering services featuring traditional and contemporary cuisines.',
      image: 'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg',
    },
    {
      title: 'Corporate Events',
      description: 'Professional catering services for business meetings, conferences, and corporate gatherings with punctual delivery.',
      image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg',
    },
    {
      title: 'Private Parties',
      description: 'Personalized catering for birthdays, anniversaries, and intimate celebrations with customized menu options.',
      image: 'https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg',
    },
  ];

  const qualityPoints = [
    'Fresh ingredients sourced daily from local suppliers',
    'Hygienic food preparation in certified kitchen facilities',
    'Experienced chefs with expertise in diverse cuisines',
    'Customizable menus to suit dietary preferences',
    'On-time delivery with professional service staff',
    'Eco-friendly packaging and sustainable practices',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Header */}
      <header style={{ display: 'none' }}>
        <h1>About SR FoodKraft - Premium Halal Catering Services Since 2014</h1>
        <p>Learn about SR FoodKraft's journey from a small family business to one of the region's most trusted catering services. Over 5000 satisfied customers and 500+ successful events.</p>
      </header>

      {/* Hero Section - Responsive */}
      <section className="bg-gradient-to-r from-black to-gray-900 text-white py-12 sm:py-16" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-poppins font-bold mb-4 sm:mb-6" itemProp="name">
            About <span className="text-gold">SR FoodKraft</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl font-inter max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto px-4" itemProp="description">
            Crafting exceptional culinary experiences for over a decade, bringing together
            traditional flavors with modern presentation to make your events unforgettable.
          </p>
        </div>
      </section>

      {/* Our Story - Responsive */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-black mb-4 sm:mb-6">
                Our Story
              </h2>
              <div className="space-y-3 sm:space-y-4 font-inter text-gray-600 text-sm sm:text-base lg:text-lg">
                <p>
                  Founded in 2014, SR FoodKraft began as a small family business with a passion
                  for authentic Indian cuisine and exceptional service. What started as catering
                  for local community events has grown into one of the region's most trusted
                  catering services.
                </p>
                <p>
                  Our founders, Suresh and Radha, believed that food should not just nourish
                  the body but also bring people together. This philosophy continues to guide
                  us as we serve thousands of customers across various celebrations and corporate events.
                </p>
                <p>
                  Today, SR FoodKraft is synonymous with quality, reliability, and culinary
                  excellence, having catered over 500 successful events and earning the trust
                  of more than 5000 satisfied customers.
                </p>
              </div>
            </div>
            <div className="relative order-first lg:order-last">
              <img
                src="https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg"
                alt="SR FoodKraft Team"
                className="rounded-lg shadow-xl w-full"
              />
              <div className="absolute -bottom-3 sm:-bottom-6 -left-3 sm:-left-6 bg-gold text-black p-2 sm:p-4 rounded-lg">
                <div className="flex items-center">
                  <Heart className="h-4 w-4 sm:h-6 sm:w-6 mr-1 sm:mr-2" />
                  <span className="font-poppins font-bold text-sm sm:text-lg">
                    Made with Love
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Achievements - Responsive */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-black mb-3 sm:mb-4">
              Our Achievements
            </h2>
            <p className="text-gray-600 font-inter text-sm sm:text-base lg:text-lg">
              Numbers that reflect our commitment to excellence
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="bg-gold rounded-full w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <achievement.icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-black" />
                </div>
                <div className="font-poppins font-bold text-xl sm:text-2xl lg:text-3xl text-black mb-1 sm:mb-2">
                  {achievement.number}
                </div>
                <div className="font-inter text-gray-600 text-xs sm:text-sm">
                  {achievement.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events We Cover - Responsive */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-black mb-3 sm:mb-4">
              Events We Cater
            </h2>
            <p className="text-gray-600 font-inter text-sm sm:text-base lg:text-lg">
              Specialized catering services for every occasion
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-40 sm:h-48 object-cover"
                />
                <div className="p-4 sm:p-6">
                  <h3 className="font-poppins font-semibold text-lg sm:text-xl text-black mb-2 sm:mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 font-inter text-sm sm:text-base">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Assurance - Responsive */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="order-first lg:order-last">
              <img
                src="https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg"
                alt="Quality Kitchen"
                className="rounded-lg shadow-xl w-full"
              />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-black mb-4 sm:mb-6">
                Quality Assurance
              </h2>
              <p className="text-gray-600 font-inter text-sm sm:text-base lg:text-lg mb-4 sm:mb-6">
                At SR FoodKraft, quality is not just a promise—it's our commitment. We maintain
                the highest standards in every aspect of our service, from ingredient sourcing
                to final presentation.
              </p>

              <div className="space-y-2 sm:space-y-3">
                {qualityPoints.map((point, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-gold mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                    <span className="font-inter text-gray-700 text-sm sm:text-base">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Values - Responsive */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-gold to-yellow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-black mb-6 sm:mb-8">
            Our Values
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-black">
            <div>
              <div className="bg-black bg-opacity-10 rounded-full w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Heart className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
              </div>
              <h3 className="font-poppins font-semibold text-base sm:text-lg mb-2">Passion</h3>
              <p className="font-inter text-sm sm:text-base">
                We pour our heart into every dish, treating each event as if it were our own celebration.
              </p>
            </div>
            <div>
              <div className="bg-black bg-opacity-10 rounded-full w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Award className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
              </div>
              <h3 className="font-poppins font-semibold text-base sm:text-lg mb-2">Excellence</h3>
              <p className="font-inter text-sm sm:text-base">
                Striving for perfection in every detail, from taste to presentation to service.
              </p>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="bg-black bg-opacity-10 rounded-full w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
              </div>
              <h3 className="font-poppins font-semibold text-base sm:text-lg mb-2">Community</h3>
              <p className="font-inter text-sm sm:text-base">
                Building lasting relationships with our customers and supporting the local community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - Responsive */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-black mb-3 sm:mb-4">
              Meet Our Team
            </h2>
            <p className="text-gray-600 font-inter text-sm sm:text-base lg:text-lg">
              The passionate people behind SR FoodKraft's success
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 sm:p-6 text-center hover:shadow-lg transition-shadow duration-300">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full mx-auto mb-3 sm:mb-4 object-cover"
                />
                <h3 className="font-poppins font-bold text-lg sm:text-xl text-black mb-1 sm:mb-2">
                  {member.name}
                </h3>
                <p className="text-gold font-inter font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                  {member.role}
                </p>
                <p className="text-gray-600 font-inter text-xs sm:text-sm mb-3 sm:mb-4">
                  {member.bio}
                </p>
                <div className="space-y-1">
                  {member.specialties.map((specialty, idx) => (
                    <span key={idx} className="inline-block bg-gold text-black text-xs px-2 py-1 rounded-full mr-1 mb-1">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials - Responsive */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-black mb-3 sm:mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600 font-inter text-sm sm:text-base lg:text-lg">
              Real feedback from our satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg p-4 sm:p-6 shadow-lg">
                <div className="flex items-center mb-3 sm:mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 sm:mr-4 object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-poppins font-semibold text-black text-sm sm:text-base">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 font-inter text-xs sm:text-sm">
                      {testimonial.event}
                    </p>
                  </div>
                </div>
                <div className="flex items-center mb-2 sm:mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-gold fill-current" />
                  ))}
                </div>
                <Quote className="h-5 w-5 sm:h-6 sm:w-6 text-gold mb-2 sm:mb-3" />
                <p className="text-gray-600 font-inter mb-2 sm:mb-3 text-sm sm:text-base">
                  "{testimonial.text}"
                </p>
                <p className="text-gray-500 font-inter text-xs sm:text-sm">
                  {testimonial.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Certifications - Responsive */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-black mb-3 sm:mb-4">
              Awards & Certifications
            </h2>
            <p className="text-gray-600 font-inter text-sm sm:text-base lg:text-lg">
              Recognition for our commitment to excellence
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {awards.map((award, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 sm:p-6 text-center hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gold rounded-full w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <award.icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-black" />
                </div>
                <h3 className="font-poppins font-semibold text-base sm:text-lg text-black mb-1 sm:mb-2">
                  {award.title}
                </h3>
                <p className="text-gray-600 font-inter text-xs sm:text-sm mb-1 sm:mb-2">
                  {award.organization}
                </p>
                <p className="text-gold font-inter font-semibold text-sm sm:text-base">
                  {award.year}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline/Milestones - Responsive */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-black mb-3 sm:mb-4">
              Our Journey
            </h2>
            <p className="text-gray-600 font-inter text-sm sm:text-base lg:text-lg">
              Key milestones in our growth and success
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gold"></div>
            <div className="space-y-6 sm:space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'lg:flex-row flex-row' : 'lg:flex-row-reverse flex-row'}`}>
                  <div className={`w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-8 lg:text-right text-left' : 'lg:pl-8 lg:text-left text-left'}`}>
                    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-lg">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gold mr-2" />
                        <span className="font-poppins font-bold text-gold text-base sm:text-lg">
                          {milestone.year}
                        </span>
                      </div>
                      <h3 className="font-poppins font-semibold text-lg sm:text-xl text-black mb-2">
                        {milestone.event}
                      </h3>
                      <p className="text-gray-600 font-inter text-sm sm:text-base">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  <div className="hidden lg:block w-6 h-6 sm:w-8 sm:h-8 bg-gold rounded-full flex items-center justify-center z-10">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                  </div>
                  <div className="hidden lg:block w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Event Gallery - Responsive */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-black mb-3 sm:mb-4">
              Event Gallery
            </h2>
            <p className="text-gray-600 font-inter text-sm sm:text-base lg:text-lg">
              Showcasing our memorable events and celebrations
            </p>
          </div>

          <div className="relative">
            <div className="bg-gray-200 rounded-lg h-64 sm:h-80 lg:h-96 flex items-center justify-center relative overflow-hidden">
              <img
                src={eventGallery[currentGalleryIndex].image}
                alt={eventGallery[currentGalleryIndex].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h3 className="font-poppins font-bold text-lg sm:text-xl lg:text-2xl mb-1 sm:mb-2">
                    {eventGallery[currentGalleryIndex].title}
                  </h3>
                  <p className="font-inter text-sm sm:text-base lg:text-lg mb-1 sm:mb-2">
                    {eventGallery[currentGalleryIndex].category}
                  </p>
                  <p className="font-inter text-xs sm:text-sm opacity-90">
                    {eventGallery[currentGalleryIndex].description}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={prevGalleryImage}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1.5 sm:p-2 transition-all"
            >
              <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6 text-black" />
            </button>

            <button
              onClick={nextGalleryImage}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1.5 sm:p-2 transition-all"
            >
              <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 text-black" />
            </button>

            <div className="flex justify-center mt-3 sm:mt-4 space-x-1 sm:space-x-2">
              {eventGallery.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentGalleryIndex(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${index === currentGalleryIndex ? 'bg-gold' : 'bg-gray-300'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability & Community - Responsive */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-white mb-3 sm:mb-4">
              Sustainability & Community
            </h2>
            <p className="text-green-100 font-inter text-sm sm:text-base lg:text-lg">
              Our commitment to environmental responsibility and community support
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {sustainabilityInitiatives.map((initiative, index) => (
              <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 sm:p-6 text-center">
                <div className="bg-white bg-opacity-20 rounded-full w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <initiative.icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
                <h3 className="font-poppins font-semibold text-base sm:text-lg text-white mb-2 sm:mb-3">
                  {initiative.title}
                </h3>
                <p className="text-green-100 font-inter text-xs sm:text-sm">
                  {initiative.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action - Responsive */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-gold to-yellow-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold text-black mb-4 sm:mb-6">
            Ready to Create Your Perfect Event?
          </h2>
          <p className="text-black font-inter text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 opacity-90">
            Let us bring our passion, expertise, and commitment to excellence to your next celebration.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-inter font-semibold text-sm sm:text-base"
            >
              <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Get a Quote
            </a>
            <a
              href="tel:+919876543210"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition-colors font-inter font-semibold text-sm sm:text-base"
            >
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Call Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { ArrowRight, ArrowUpRight, CheckCircle2, Clock, Users, Heart, Star } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useState, useEffect } from 'react';
import api from '../lib/api';

const fallbackTherapists = [
  {
    _id: '1',
    firstName: 'Dr. Emily',
    lastName: 'Carter',
    specialization: 'Sports Injury Specialist',
    profilePictureUrl: '/images/team-1.svg',
    bio: 'Emily has over 10 years of experience helping athletes recover and return to peak performance.',
  },
  {
    _id: '2',
    firstName: 'Dr. John',
    lastName: 'Smith',
    specialization: 'Orthopedic Physiotherapist',
    profilePictureUrl: '/images/team-2.svg',
    bio: 'John specializes in orthopedic rehabilitation and chronic pain management for all ages.',
  },
  {
    _id: '3',
    firstName: 'Dr. Sarah',
    lastName: 'Lee',
    specialization: 'Pediatric Physiotherapist',
    profilePictureUrl: '/images/team-3.svg',
    bio: 'Sarah is passionate about helping children achieve their developmental milestones through fun, effective therapy.',
  },
];

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [therapists, setTherapists] = useState([]);

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const response = await api.get('/therapists/approved');
        if (response.data.data && response.data.data.length > 0) {
          setTherapists(response.data.data);
        } else {
          setTherapists(fallbackTherapists);
        }
      } catch (error) {
        console.error('Error fetching therapists, using fallback:', error);
        setTherapists(fallbackTherapists);
      }
    };
    fetchTherapists();
  }, []);
  
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Recovery Patient",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      content: "The physiotherapists at PhysioMe helped me recover from a serious knee injury. Their personalized approach and dedication made all the difference in my recovery journey.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Sports Rehabilitation",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      content: "As an athlete, finding the right physiotherapy care is crucial. The team at PhysioMe understood my needs and helped me get back to my sport faster than I expected.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Chronic Pain Patient",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80",
      content: "After years of chronic back pain, I finally found relief through the treatment plan developed by PhysioMe. Their holistic approach addressed not just my symptoms but the root causes.",
      rating: 4
    }
  ]
  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Expert Therapists',
      description: 'Our team of certified physiotherapists brings years of experience and expertise to your care.',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Flexible Scheduling',
      description: 'Book appointments that fit your schedule with our easy online booking system.',
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Personalized Care',
      description: 'Receive customized treatment plans tailored to your specific needs and goals.',
    },
  ];

  const services = [
    {
      title: 'Physical Therapy',
      description: 'Comprehensive treatment for injuries, chronic conditions, and post-surgery rehabilitation.',
    },
    {
      title: 'Sports Rehabilitation',
      description: 'Specialized care for athletes and sports-related injuries to get you back in the game.',
    },
    {
      title: 'Manual Therapy',
      description: 'Hands-on techniques to reduce pain and improve mobility in joints and soft tissues.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 z-10" />
        <motion.div
          initial={{ scale: 1.1, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 0.8 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
            backgroundPosition: 'center',
          }}
        />
        <div className="container mx-auto px-4 py-20 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <motion.span 
                className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                Professional Physiotherapy Care
              </motion.span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Your Journey to <span className="text-white/90 italic">Better Health</span> Starts Here
              </h1>
              <p className="text-xl mb-8 text-white/90 max-w-xl">
                Experience expert physiotherapy care tailored to your unique needs. We're here to help you move better, feel better, and live better.
              </p>
              <div className="flex flex-wrap gap-4">
                {isAuthenticated && user?.role === 'patient' ? (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/patient/appointments/new">
                      <Button size="lg" className="cursor-pointer bg-white text-primary hover:bg-white/90 shadow-lg">
                        Book Appointment
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </motion.div>
                ) : isAuthenticated && user?.role === 'therapist' ? (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/therapist/dashboard">
                      <Button size="lg" className="cursor-pointer bg-white text-primary hover:bg-white/90 shadow-lg">
                        View Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/register?role=patient">
                      <Button size="lg" className="cursor-pointer bg-white text-primary hover:bg-white/90 shadow-lg">
                        Book Appointment
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </motion.div>
                )}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/services">
                    <Button size="lg" variant="outline" className="cursor-pointer text-white border-white hover:bg-white/10 shadow-lg">
                      Our Services
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              className="hidden lg:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div className="relative">
                <div className="absolute -inset-4 rounded-xl bg-white/10 backdrop-blur-sm -z-10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80" 
                  alt="Physiotherapy Session" 
                  className="rounded-lg shadow-2xl w-full h-auto object-cover"
                />
                <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-xl p-4 flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Certified Therapists</p>
                    <p className="text-xs text-muted-foreground">Professional & Experienced</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-background to-transparent z-20"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Our Advantages
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Why Choose PhysioMe
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We're committed to providing the highest quality physiotherapy care with a focus on personalized treatment and patient education.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="bg-card rounded-xl p-8 shadow-md border border-border/50 hover:shadow-lg transition-all duration-300 hover:border-primary/20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="bg-primary/10 rounded-full p-4 inline-block mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-accent/30">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              What We Offer
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Our Services
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We offer a comprehensive range of physiotherapy services to address various conditions and help you achieve optimal health.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div 
                key={index} 
                className="bg-card rounded-xl p-8 shadow-md border border-border/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-10 group-hover:bg-primary/10 transition-colors duration-300"></div>
                <div className="mb-6">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-6">{service.description}</p>
                <Link to={service.link} className="text-primary hover:text-primary/80 inline-flex items-center font-medium transition-colors">
                  Learn more <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Expert Team Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Meet Our Expert Team
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Our Physiotherapy Specialists
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Our team of certified physiotherapists brings years of specialized training and experience to provide you with the highest quality care.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {therapists.slice(0, 3).map((therapist, index) => (
              <motion.div
                key={therapist._id}
                className="bg-card rounded-xl p-8 shadow-md border border-border/50 flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <img src={therapist.profilePictureUrl || '/images/team-1.svg'} alt={therapist.name} className="w-28 h-28 rounded-full mb-4 object-cover border-4 border-primary/20" />
                <h3 className="text-xl font-semibold mb-1">{therapist.name}</h3>
                <p className="text-primary font-medium mb-2">{therapist.specialization}</p>
                <p className="text-muted-foreground text-sm mb-4">{therapist.bio || 'A dedicated therapist providing excellent care.'}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Recovery Journey?</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
                Book an appointment today and take the first step towards better health and mobility.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/register?role=patient">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
                      Book Your First Session
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/contact">
                    <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 shadow-lg">
                      Contact Us
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
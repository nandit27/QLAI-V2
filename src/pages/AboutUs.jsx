import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { CountUp } from "@/components/ui/count-up";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import {
  Monitor,
  Palette,
  Cpu,
  Server,
  Sparkles,
  Target,
  Coffee,
  Code2,
  Zap,
  Globe,
} from "lucide-react";

// Local team avatars
import nanditImg from "@/assets/nandit.png";
import jugalImg from "@/assets/jugal.png";
import rajuImg from "@/assets/raju.png";
import bhavyaImg from "@/assets/bhavya.png";

const AnimatedSection = ({ children, className = "", delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, threshold: 0.1 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      transition={{ duration: 0.6, delay }}
      variants={{
        visible: { opacity: 1, y: 0, scale: 1 },
        hidden: { opacity: 0, y: 50, scale: 0.95 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const FloatingIcon = ({ icon: Icon, className = "", delay = 0 }) => (
  <motion.div
    animate={{
      y: [0, -10, 0],
      rotate: [0, 5, 0, -5, 0],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay,
    }}
    className={className}
  >
    <Icon className="text-[#95ff00] opacity-20" size={24} />
  </motion.div>
);

export default function AboutUs() {
  const teamMembers = [
    {
      name: "Nandit",
      surname: "Kalaria",
      role: "The Frontend Fnatic",
      description:
        "Bringing ideas to life, one pixel at a time. Nandit is the code wizard who turns static designs into responsive, sleek, and interactive user interfaces that keep users engaged and coming back for more.",
      avatar: nanditImg,
      icon: <Monitor className="text-[#95ff00]" size={20} />,
      socials: {
        linkedin: "https://www.linkedin.com/in/nandit-kalaria-06281631a/",
        github: "https://github.com/nandit27",
        twitter: "https://www.instagram.com/nanditz_27?igsh=MWkyYW1tMTA2a3E3MA==",
      },
    },
    {
      name: "Jugal",
      surname: "Salaskar",
      role: "The Creative Engine",
      description:
        "Designs intuitive experiences and ensures everything looks polished and user-friendly. Jugal turns complex problems into beautiful, simple solutions that users love to interact with every day.",
      avatar: jugalImg,
      icon: <Palette className="text-[#95ff00]" size={20} />,
      socials: {
        linkedin: "https://www.linkedin.com/in/jugal-salaskar-6622442a7",
        github: "#",
        twitter: "https://www.instagram.com/jugal21.jpg?igsh=MXIzcmhmNzQyMXB2NA==",
      },
    },
    {
      name: "Raj",
      surname: "Shah",
      role: "AI Visionary & Architect",
      description:
        "Where logic meets learning. Raj is the brain behind QuickLearn AI's intelligent engine. From designing models to enhancing performance, he ensures the AI learns the way students do - efficiently and intuitively.",
      avatar: rajuImg,
      icon: <Cpu className="text-[#95ff00]" size={20} />,
      socials: {
        linkedin: "https://www.linkedin.com/in/raj-shah-r2237/",
        github: "https://github.com/raj2237",
        twitter: "https://www.instagram.com/_.raj_22?igsh=NmNmdzY3a2wyM2lu",
      },
    },
    {
      name: "Bhavya",
      surname: "Prajapati",
      role: "The Backend Buster",
      description:
        "Building the logic behind the magic. Bhavya builds and maintains the core foundation of QuickLearn AI - APIs, databases, server handling - he ensures everything works seamlessly behind the scenes.",
      avatar: bhavyaImg,
      icon: <Server className="text-[#95ff00]" size={20} />,
      socials: {
        linkedin: "https://www.linkedin.com/in/bhavya-prajapati1/",
        github: "https://github.com/bhavyagp",
        twitter: "https://instagram.com/bhavya5.exe",
      },
    },
  ];

  const contributors = [
    "Ishita Prajapati",
    "Vraj Mevawala",
    "Yug Moradiya",
    "Kavyaraj",
  ];

  const stats = [
    { numericValue: 1000, suffix: "+", label: "Happy Students" },
    { numericValue: 50, suffix: "+", label: "Features Built" },
    { numericValue: null, suffix: "∞", label: "Ideas Generated" },
    { numericValue: 100, suffix: "%", label: "Passion Driven" },
  ];

  return (
    <div className="min-h-screen bg-[#000805] text-white relative overflow-hidden pt-24">
      {/* Floating Background Icons */}
      <div className="fixed inset-0 pointer-events-none">
        <FloatingIcon
          icon={Code2}
          className="absolute top-20 left-10"
          delay={0}
        />
        <FloatingIcon
          icon={Sparkles}
          className="absolute top-40 right-20"
          delay={1}
        />
        <FloatingIcon
          icon={Target}
          className="absolute bottom-40 left-20"
          delay={2}
        />
        <FloatingIcon
          icon={Zap}
          className="absolute bottom-20 right-10"
          delay={3}
        />
        <FloatingIcon
          icon={Globe}
          className="absolute top-1/2 left-1/4"
          delay={4}
        />
        <FloatingIcon
          icon={Coffee}
          className="absolute top-1/3 right-1/4"
          delay={5}
        />
      </div>

      <div className="relative z-10 px-4 py-12 max-w-7xl mx-auto">
        {/* Hero Section */}
        <AnimatedSection className="text-center mb-20">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="inline-block mb-6"
          >
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight">
              Know{" "}
              <span className="text-[#95ff00] relative">
                About Us
                <motion.div
                  animate={{ width: ["0%", "100%"] }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute bottom-0 left-0 h-1 bg-[#95ff00] rounded-full"
                />
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            We're not just developers - we're learning revolutionists! 🚀
          </motion.p>
        </AnimatedSection>

        {/* Company Description */}
        <AnimatedSection delay={0.2} className="mb-20">
          <div className="max-w-5xl mx-auto">
            <Card className="bg-[#000A06] border-2 border-[#95ff00] rounded-3xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#95ff00]/5 to-transparent" />
              <CardContent className="p-8 md:p-12 relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-[#002014] rounded-full border border-[#95ff00]">
                    <Sparkles className="text-[#95ff00]" size={24} />
                  </div>
                  <h2 className="text-3xl font-bold text-[#95ff00]">
                    Our Mission
                  </h2>
                </div>
                <p className="text-lg text-gray-300 leading-relaxed">
                  <span className="text-[#95ff00] font-semibold">
                    QuickLearn AI
                  </span>{" "}
                  is an intelligent learning assistant that transforms
                  educational content into{" "}
                  <span className="text-[#95ff00]">
                    interactive summaries and quizzes
                  </span>
                  . It helps students learn faster, smarter, and more
                  effectively by{" "}
                  <span className="text-[#95ff00]">
                    Simplifying Complex Videos into Digestible Insights
                  </span>
                  . Powered by AI, it personalizes the learning journey and
                  makes revision effortless. Whether it's YouTube lectures or
                  lengthy tutorials, QuickLearn AI is your{" "}
                  <span className="text-[#95ff00] font-semibold">
                    shortcut to smart studying
                  </span>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        </AnimatedSection>

        {/* Stats Section */}
        <AnimatedSection delay={0.3} className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center p-6 bg-[#000A06] border border-[#95ff00]/30 rounded-2xl hover:border-[#95ff00] transition-all duration-300"
              >
                <div className="text-3xl font-bold text-[#95ff00] mb-2">
                  {stat.numericValue !== null ? (
                    <CountUp
                      to={stat.numericValue}
                      suffix={stat.suffix}
                      duration={stat.numericValue > 999 ? 2.5 : 2}
                      separator={stat.numericValue > 999 ? "," : ""}
                    />
                  ) : (
                    <span>{stat.suffix}</span>
                  )}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* Team Section */}
        <AnimatedSection delay={0.4} className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              Meet <span className="text-[#95ff00]">Our Team</span>
            </h2>
            <p className="text-xl text-gray-400">
              The amazing humans behind the magic ✨
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={`${member.name}-${member.surname}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="bg-[#000A06] border-2 border-[#95ff00] rounded-2xl overflow-hidden h-full relative transition-all duration-300 hover:shadow-lg hover:shadow-[#95ff00]/20">
                  <CardContent className="p-6 relative">
                    {/* Header with Avatar and Icon */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16 border-2 border-[#95ff00] bg-[#002014]">
                          <AvatarImage
                            src={member.avatar}
                            alt={`${member.name} ${member.surname}`}
                          />
                          <AvatarFallback className="bg-[#002014] text-[#95ff00] text-lg font-bold">
                            {member.name[0]}
                            {member.surname[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">
                            {member.name} {member.surname}
                          </h3>
                          <p className="text-[#95ff00] text-sm font-medium">
                            "{member.role}"
                          </p>
                        </div>
                      </div>

                      <div className="p-2 bg-[#002014] rounded-lg border border-[#95ff00]">
                        {member.icon}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm leading-relaxed mb-6">
                      {member.description}
                    </p>

                    {/* Social Media Icons */}
                    <div className="flex justify-start gap-3">
                      {Object.entries(member.socials).map(([platform, url]) => {
                        const IconComponent = {
                          linkedin: FaLinkedin,
                          github: FaGithub,
                          twitter: FaInstagram,
                        }[platform];

                        return (
                          <motion.a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 bg-[#002014] text-[#95ff00] rounded-lg border border-[#95ff00]/30 hover:border-[#95ff00] transition-colors"
                          >
                            <IconComponent size={14} />
                          </motion.a>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* Contributors Section */}
        <AnimatedSection delay={0.5} className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#95ff00] mb-4">
              Contributors
            </h2>
            <p className="text-gray-400">
              Special thanks to our amazing contributors who helped make this
              possible
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {contributors.map((contributor, index) => (
              <motion.div
                key={contributor}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                viewport={{ once: true }}
                className="px-6 py-3 bg-[#002014] border border-[#95ff00] rounded-full text-[#95ff00] font-medium hover:bg-[#0C3D2A] transition-colors"
              >
                {contributor}
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* Connect Section */}
        <AnimatedSection delay={0.6} className="text-center">
          <motion.div whileHover={{ scale: 1.02 }} className="inline-block">
            <Card className="bg-[#000A06] border-2 border-[#95ff00] rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-3xl font-bold text-[#95ff00] mb-4">
                  Connect with Us
                </h3>
                <p className="text-gray-300 mb-6 max-w-md mx-auto">
                  Ready to revolutionize your learning journey? Let's connect
                  and build the future of education together!
                </p>

                <div className="flex justify-center gap-4">
                  {teamMembers.map((member) => (
                    <motion.div
                      key={`${member.name}-${member.surname}`}
                      whileHover={{ y: -5 }}
                      className="p-4 bg-[#002014] border border-[#95ff00]/30 rounded-2xl hover:border-[#95ff00] transition-colors group"
                    >
                      <div className="text-center">
                        <Avatar className="w-12 h-12 mx-auto mb-2 border-2 border-[#95ff00] group-hover:scale-110 transition-transform">
                          <AvatarImage
                            src={member.avatar}
                            alt={`${member.name} ${member.surname}`}
                          />
                          <AvatarFallback className="bg-[#002014] text-[#95ff00] text-sm">
                            {member.name[0]}
                            {member.surname[0]}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-gray-400">{member.name}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatedSection>
      </div>
    </div>
  );
}

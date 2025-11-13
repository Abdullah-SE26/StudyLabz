"use client";
import React, { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { useInView } from "react-intersection-observer";
import {
  IconUserHexagon,
  IconCertificate,
  IconHelpHexagon,
} from "@tabler/icons-react";

const StatCard = ({ icon: IconComponent, label, value, animate, delay }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!animate) return;
    let current = 0;
    const step = Math.ceil(value / 50);
    const interval = setInterval(() => {
      current += step;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(current);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [animate, value]);

  return (
    <div
      className="fadein-delay bg-white border border-sf-border rounded-2xl p-6 shadow-sm"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-sf-green text-white mb-3">
          <IconComponent size={28} />
        </div>
        <p className="text-4xl font-extrabold text-sf-text mb-1 leading-none">
          {displayValue.toLocaleString()}
        </p>
        <p className="text-base text-sf-text/70">{label}</p>
      </div>
    </div>
  );
};

const StatsSection = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalQuestions: 0,
  });
  const [inViewRef, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/dashboard/stats/public"); // <- public endpoint
        const data = res.data.data;
        setStats({
          totalUsers: data.totalUsers || 0,
          totalCourses: data.totalCourses || 0,
          totalQuestions: data.totalQuestions || 0,
        });
        setLoaded(true);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <section
      ref={inViewRef}
      className="relative py-20 text-white bg-sf-text fadein rounded-b-[6rem]"
    >
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-12 fadein-slow">
          Our Growing Community
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <StatCard
            icon={IconUserHexagon}
            label="Users"
            value={stats.totalUsers}
            animate={inView && loaded}
            delay={0.1}
          />
          <StatCard
            icon={IconCertificate}
            label="Courses"
            value={stats.totalCourses}
            animate={inView && loaded}
            delay={0.2}
          />
          <StatCard
            icon={IconHelpHexagon}
            label="Questions"
            value={stats.totalQuestions}
            animate={inView && loaded}
            delay={0.3}
          />
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

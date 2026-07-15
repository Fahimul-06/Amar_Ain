import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabase';

type Language = 'en' | 'bn';
type LanguageContextValue = { language: Language; setLanguage: (language: Language) => Promise<void>; toggleLanguage: () => Promise<void>; t: (text: string) => string; };

const PHRASES: Record<string, string> = {
  'Amar Ain':'আমার আইন','Find Lawyers':'আইনজীবী খুঁজুন','Find a lawyer':'আইনজীবী খুঁজুন','Legal Info':'আইনি তথ্য','Legal Information':'আইনি তথ্য','How it Works':'কীভাবে কাজ করে','How it works':'কীভাবে কাজ করে','For Lawyers':'আইনজীবীদের জন্য','Support':'সহায়তা','Help Center':'সহায়তা কেন্দ্র','Safety':'নিরাপত্তা','Disputes':'বিরোধ','Contact':'যোগাযোগ','Log in':'লগ ইন','Sign up':'নিবন্ধন','Sign up free':'বিনামূল্যে নিবন্ধন','Sign out':'লগ আউট','Dashboard':'ড্যাশবোর্ড','Account':'অ্যাকাউন্ট','Home':'হোম','Go home':'হোমে যান','Page not found':'পৃষ্ঠা পাওয়া যায়নি',"The page you're looking for doesn't exist.":'আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি নেই।',
  'AI Legal Assistant':'এআই আইনি সহকারী','AI Legal Assistant for Bangladesh':'বাংলাদেশের জন্য এআই আইনি সহকারী','Ask AI assistant':'এআই সহকারীকে জিজ্ঞাসা করুন','Ask a legal question — get instant info':'আইনি প্রশ্ন করুন — তাৎক্ষণিক তথ্য পান','Use our AI legal assistant for general questions, or browse verified lawyers by category, location, fee, and rating.':'সাধারণ প্রশ্নের জন্য আমাদের এআই আইনি সহকারী ব্যবহার করুন, অথবা বিভাগ, অবস্থান, ফি ও রেটিং অনুযায়ী যাচাইকৃত আইনজীবী খুঁজুন।',
  'Everything you need, in one platform':'আপনার প্রয়োজনীয় সবকিছু, একটি প্ল্যাটফর্মে','From quick questions to full case management — we\'ve got you covered.':'দ্রুত প্রশ্ন থেকে পূর্ণাঙ্গ মামলা ব্যবস্থাপনা—সবকিছুতেই আমরা পাশে আছি।','Search & Compare':'খুঁজুন ও তুলনা করুন','Book a Consultation':'পরামর্শ বুক করুন','Book a consultation':'পরামর্শ বুক করুন','Pay Securely':'নিরাপদে পরিশোধ করুন','Chat & Track':'চ্যাট ও অগ্রগতি দেখুন','Verified & Trusted':'যাচাইকৃত ও বিশ্বস্ত','Verified Lawyers':'যাচাইকৃত আইনজীবী','Verified lawyers':'যাচাইকৃত আইনজীবী','Verified':'যাচাইকৃত','Available':'উপলভ্য','Top rated':'সর্বোচ্চ রেটিং','Most experienced':'সবচেয়ে অভিজ্ঞ','Fee: low to high':'ফি: কম থেকে বেশি','Fee: high to low':'ফি: বেশি থেকে কম','All categories':'সব বিভাগ','All cities':'সব শহর','Any language':'যেকোনো ভাষা','Minimum rating':'ন্যূনতম রেটিং','Filters':'ফিল্টার','Search by name, category, or bar ID...':'নাম, বিভাগ বা বার আইডি দিয়ে খুঁজুন...','No lawyers match your filters':'আপনার ফিল্টারের সঙ্গে কোনো আইনজীবী মেলেনি','Try widening your search or resetting filters.':'অনুসন্ধান বিস্তৃত করুন বা ফিল্টার রিসেট করুন।','Back to lawyers':'আইনজীবীদের তালিকায় ফিরুন','Lawyer not found':'আইনজীবী পাওয়া যায়নি','This profile may have been removed.':'এই প্রোফাইলটি সরানো হয়ে থাকতে পারে।',
  'Overview':'সারসংক্ষেপ','Bookings':'বুকিংসমূহ','Booking':'বুকিং','Cases':'মামলাসমূহ','Case':'মামলা','Messages':'বার্তাসমূহ','Payments':'পেমেন্টসমূহ','Reviews':'পর্যালোচনাসমূহ','Profile':'প্রোফাইল','Services':'সেবাসমূহ','Availability':'সময়সূচি','Earnings':'আয়','Withdrawals':'উত্তোলন','Users':'ব্যবহারকারী','Lawyers':'আইনজীবী','Legal Content':'আইনি কনটেন্ট','Reports':'প্রতিবেদন','Operations':'পরিচালনা','Admin Overview':'অ্যাডমিন সারসংক্ষেপ','Client':'ক্লায়েন্ট','Lawyer':'আইনজীবী','Admin':'অ্যাডমিন','User':'ব্যবহারকারী','Role':'ভূমিকা','Status':'অবস্থা','Actions':'কার্যক্রম','Search by name or phone...':'নাম বা ফোন দিয়ে খুঁজুন...','All roles':'সব ভূমিকা','No users found.':'কোনো ব্যবহারকারী পাওয়া যায়নি।','Suspend':'স্থগিত করুন','Reactivate':'পুনরায় সক্রিয় করুন','Verify':'যাচাই করুন','Reject':'প্রত্যাখ্যান করুন','Approve':'অনুমোদন করুন','Delete':'মুছুন','Edit':'সম্পাদনা','View':'দেখুন','Save':'সংরক্ষণ','Saved':'সংরক্ষিত','Cancel':'বাতিল','Close':'বন্ধ করুন','Accept':'গ্রহণ করুন','Decline':'প্রত্যাখ্যান করুন','Complete':'সম্পন্ন করুন','Mark completed':'সম্পন্ন হিসেবে চিহ্নিত করুন','Mark resolved':'সমাধান হয়েছে হিসেবে চিহ্নিত করুন','Resolve dispute':'বিরোধ সমাধান করুন',
  'Pending':'অপেক্ষমাণ','Confirmed':'নিশ্চিত','Completed':'সম্পন্ন','Cancelled':'বাতিল','Disputed':'বিরোধপূর্ণ','Open':'খোলা','Closed':'বন্ধ','In Progress':'চলমান','On Hold':'স্থগিত','Published':'প্রকাশিত','Draft':'খসড়া','Archived':'সংরক্ষিত','Suspended':'স্থগিত','Successful':'সফল','Failed':'ব্যর্থ','Paid':'পরিশোধিত','Refunded':'ফেরত দেওয়া হয়েছে','Under review':'পর্যালোচনাধীন',
  'Full name':'পূর্ণ নাম','Full name *':'পূর্ণ নাম *','Your full name':'আপনার পূর্ণ নাম','Your name':'আপনার নাম','Email':'ইমেইল','Password':'পাসওয়ার্ড','Phone':'ফোন','Phone number':'ফোন নম্বর','Phone (optional)':'ফোন (ঐচ্ছিক)','Location':'অবস্থান','Bio':'পরিচিতি','Language':'ভাষা','Languages':'ভাষাসমূহ','Office':'চেম্বার','Office address':'চেম্বারের ঠিকানা','Category':'বিভাগ','Practice area':'চর্চার ক্ষেত্র','Experience (years)':'অভিজ্ঞতা (বছর)','Consultation fee':'পরামর্শ ফি','Consultation fee (BDT)':'পরামর্শ ফি (টাকা)','Fee':'ফি','Fee (BDT)':'ফি (টাকা)','Amount':'পরিমাণ','Amount (BDT)':'পরিমাণ (টাকা)','Date':'তারিখ','Time':'সময়','Title':'শিরোনাম','Title (English)':'শিরোনাম (ইংরেজি)','Title (Bangla)':'শিরোনাম (বাংলা)','Description':'বিবরণ','Description (optional)':'বিবরণ (ঐচ্ছিক)','Subject':'বিষয়','Message':'বার্তা','Notes (optional)':'নোট (ঐচ্ছিক)','Topic':'বিষয়','Reason':'কারণ','Resolution':'সমাধান','Resolution notes':'সমাধানের নোট','Comment (optional)':'মন্তব্য (ঐচ্ছিক)','Rating':'রেটিং','Type':'ধরন','Method':'পদ্ধতি','Duration (min)':'সময়কাল (মিনিট)','Service type':'সেবার ধরন','Payment method':'পেমেন্ট পদ্ধতি','Transaction ID':'লেনদেন আইডি','Txn ID':'লেনদেন আইডি',
  'Text Chat':'টেক্সট চ্যাট','Text Consultation':'টেক্সট পরামর্শ','Phone Call':'ফোন কল','Phone Consultation':'ফোন পরামর্শ','Audio Call':'অডিও কল','Video Call':'ভিডিও কল','Video / Audio Call':'ভিডিও / অডিও কল','In-Person':'সশরীরে','In-Person Meeting':'সশরীরে সাক্ষাৎ','Document Drafting':'দলিল খসড়া','Secure Messaging':'নিরাপদ বার্তা','Secure chat':'নিরাপদ চ্যাট','Private Messaging':'ব্যক্তিগত বার্তা','Upload document':'দলিল আপলোড করুন','Upload a document':'একটি দলিল আপলোড করুন','Documents':'দলিলসমূহ','Document URL':'দলিলের লিংক','File name':'ফাইলের নাম','View document':'দলিল দেখুন','No documents uploaded':'কোনো দলিল আপলোড করা হয়নি','Create a new case':'নতুন মামলা তৈরি করুন','New case':'নতুন মামলা','Case title':'মামলার শিরোনাম','Describe your case...':'আপনার মামলার বিবরণ লিখুন...','No cases yet':'এখনও কোনো মামলা নেই','No open cases':'কোনো খোলা মামলা নেই','Open Cases':'খোলা মামলা','Open cases':'খোলা মামলা',
  'Send message':'বার্তা পাঠান','Type a message...':'বার্তা লিখুন...','Message sent!':'বার্তা পাঠানো হয়েছে!','No messages yet. Say hello!':'এখনও কোনো বার্তা নেই। শুভেচ্ছা জানান!','No conversations':'কোনো কথোপকথন নেই','No conversations yet.':'এখনও কোনো কথোপকথন নেই।','Select a lawyer':'একজন আইনজীবী নির্বাচন করুন','Select a booking':'একটি বুকিং নির্বাচন করুন','Select a case':'একটি মামলা নির্বাচন করুন','Select a topic':'একটি বিষয় নির্বাচন করুন','Select category':'বিভাগ নির্বাচন করুন','Select time':'সময় নির্বাচন করুন','Brief topic of consultation':'পরামর্শের সংক্ষিপ্ত বিষয়','Any details for the lawyer':'আইনজীবীর জন্য অতিরিক্ত তথ্য','Continue to payment':'পেমেন্টে এগিয়ে যান','Complete Payment':'পেমেন্ট সম্পন্ন করুন','This is a demo payment — no real charge is made.':'এটি ডেমো পেমেন্ট—কোনো প্রকৃত অর্থ কাটা হবে না।','You\'re paying':'আপনি পরিশোধ করছেন','Your payout':'আপনার প্রাপ্য','Platform commission':'প্ল্যাটফর্ম কমিশন','Platform fee':'প্ল্যাটফর্ম ফি','Gross':'মোট','Net earnings':'নিট আয়','Total Earnings':'মোট আয়','Total earnings':'মোট আয়','Available balance':'উপলভ্য ব্যালেন্স','Request withdrawal':'উত্তোলনের অনুরোধ করুন','No earnings yet.':'এখনও কোনো আয় নেই।','No withdrawal requests':'কোনো উত্তোলনের অনুরোধ নেই','bKash':'বিকাশ','Nagad':'নগদ','Bank Transfer':'ব্যাংক ট্রান্সফার',
  'Create profile':'প্রোফাইল তৈরি করুন','Create your lawyer profile':'আপনার আইনজীবী প্রোফাইল তৈরি করুন','Professional details':'পেশাগত তথ্য','Basic information':'মৌলিক তথ্য','Bar Council ID':'বার কাউন্সিল আইডি','Bar Council ID *':'বার কাউন্সিল আইডি *','Verification document':'যাচাইয়ের দলিল','Verification':'যাচাই','Verification status:':'যাচাইয়ের অবস্থা:','Lawyer Verification':'আইনজীবী যাচাই','Profile & verification':'প্রোফাইল ও যাচাই','Services & Fees':'সেবা ও ফি','Add service':'সেবা যোগ করুন','Add a service':'একটি সেবা যোগ করুন','No services yet':'এখনও কোনো সেবা নেই','Weekly availability':'সাপ্তাহিক সময়সূচি','Available:':'উপলভ্য:','Pending bookings':'অপেক্ষমাণ বুকিং','No pending bookings':'কোনো অপেক্ষমাণ বুকিং নেই','Upcoming consultations':'আসন্ন পরামর্শ','Completed consultations':'সম্পন্ন পরামর্শ','No upcoming bookings':'কোনো আসন্ন বুকিং নেই','Booking management':'বুকিং ব্যবস্থাপনা','Earnings & withdrawals':'আয় ও উত্তোলন','Earnings overview':'আয়ের সারসংক্ষেপ',
  'Legal Categories':'আইনের বিভাগসমূহ','Search legal topics...':'আইনি বিষয় খুঁজুন...','Browse articles on Bangladesh law — from family matters to property, criminal procedure, and consumer rights.':'বাংলাদেশের আইন নিয়ে প্রবন্ধ পড়ুন—পারিবারিক বিষয় থেকে সম্পত্তি, ফৌজদারি প্রক্রিয়া ও ভোক্তা অধিকার পর্যন্ত।','No articles found':'কোনো প্রবন্ধ পাওয়া যায়নি','No legal content yet':'এখনও কোনো আইনি কনটেন্ট নেই','New article':'নতুন প্রবন্ধ','Body':'মূল লেখা','All':'সব','Contact Us':'আমাদের সঙ্গে যোগাযোগ করুন','Contact support':'সহায়তা টিমে যোগাযোগ করুন','Send us a message':'আমাদের বার্তা পাঠান','Tell us how we can help...':'কীভাবে সাহায্য করতে পারি লিখুন...','Thank you for reaching out. We\'ll respond within 24 hours.':'যোগাযোগ করার জন্য ধন্যবাদ। আমরা ২৪ ঘণ্টার মধ্যে উত্তর দেব।','General Inquiry':'সাধারণ জিজ্ঞাসা','Technical Issue':'প্রযুক্তিগত সমস্যা','Booking Issue':'বুকিং সমস্যা','Payment Problem':'পেমেন্ট সমস্যা','Feedback / Suggestion':'মতামত / পরামর্শ',
  'Privacy Policy':'গোপনীয়তা নীতি','Terms of Service':'সেবার শর্তাবলি','Bar Council Compliance':'বার কাউন্সিল সম্মতি','About':'সম্পর্কে','For Clients':'ক্লায়েন্টদের জন্য','Platform':'প্ল্যাটফর্ম','Legal':'আইনি','All rights reserved.':'সর্বস্বত্ব সংরক্ষিত।','Made for Bangladesh 🇧🇩':'বাংলাদেশের জন্য তৈরি 🇧🇩','Your Safety, Our Priority':'আপনার নিরাপত্তা, আমাদের অগ্রাধিকার','Learn how we keep you safe on the platform.':'প্ল্যাটফর্মে আমরা কীভাবে আপনাকে নিরাপদ রাখি জানুন।','Secure Payments':'নিরাপদ পেমেন্ট','Document Protection':'দলিল সুরক্ষা','Refund policy':'অর্থ ফেরত নীতি','Report a problem':'সমস্যা জানান','Report now':'এখনই জানান','Open a dispute':'বিরোধ উত্থাপন করুন','Raise a dispute':'বিরোধ উত্থাপন করুন','Dispute Resolution':'বিরোধ নিষ্পত্তি','No disputes':'কোনো বিরোধ নেই','Open disputes':'খোলা বিরোধ','Open Disputes':'খোলা বিরোধ','Dispute submitted':'বিরোধ জমা হয়েছে','Dispute open':'বিরোধ খোলা হয়েছে','Describe what happened...':'কী ঘটেছে লিখুন...','Describe what happened in detail...':'কী ঘটেছে বিস্তারিত লিখুন...','Valid reasons for a dispute':'বিরোধের গ্রহণযোগ্য কারণসমূহ',
  'Loading...':'লোড হচ্ছে...','Loading bookings...':'বুকিং লোড হচ্ছে...','No bookings':'কোনো বুকিং নেই','No bookings.':'কোনো বুকিং নেই।','No bookings found':'কোনো বুকিং পাওয়া যায়নি','No payments yet':'এখনও কোনো পেমেন্ট নেই','No payments.':'কোনো পেমেন্ট নেই।','No reviews':'কোনো পর্যালোচনা নেই','No reviews yet':'এখনও কোনো পর্যালোচনা নেই','No results found.':'কোনো ফল পাওয়া যায়নি।','All caught up':'সব হালনাগাদ','All clear — no disputes have been raised.':'সব ঠিক আছে—কোনো বিরোধ উত্থাপিত হয়নি।','Ready to get started?':'শুরু করতে প্রস্তুত?','Need legal help?':'আইনি সহায়তা দরকার?','Browse lawyers':'আইনজীবী দেখুন','Join as a lawyer':'আইনজীবী হিসেবে যোগ দিন','Learn more':'আরও জানুন','View all':'সব দেখুন','Back to search':'অনুসন্ধানে ফিরুন','Within 24 hours':'২৪ ঘণ্টার মধ্যে','24/7 support · Dispute resolution · Refund protection':'২৪/৭ সহায়তা · বিরোধ নিষ্পত্তি · অর্থ ফেরত সুরক্ষা'
};


const EXTRA_PHRASES: Record<string, string> = {
  '1. Ask or search':'১. জিজ্ঞাসা করুন বা খুঁজুন','2. Book a consultation':'২. পরামর্শ বুক করুন','3. Pay securely':'৩. নিরাপদে পরিশোধ করুন','4. Chat & track':'৪. চ্যাট করুন ও অগ্রগতি দেখুন','10% commission':'১০% কমিশন','6-digit code':'৬ সংখ্যার কোড',
  'A simple, secure way to get legal help in Bangladesh — from first question to resolved case.':'বাংলাদেশে আইনি সহায়তা পাওয়ার একটি সহজ ও নিরাপদ উপায়—প্রথম প্রশ্ন থেকে মামলা সমাধান পর্যন্ত।','Acceptance of Terms':'শর্তাবলি গ্রহণ','Account Data':'অ্যাকাউন্টের তথ্য','Account Registration':'অ্যাকাউন্ট নিবন্ধন','Account number':'অ্যাকাউন্ট নম্বর','Admins':'অ্যাডমিনগণ','Amar Ain provides the following services:':'আমার আইন নিম্নলিখিত সেবাগুলো প্রদান করে:','Approval':'অনুমোদন','Avg. Rating':'গড় রেটিং','Bar Council ID Submission':'বার কাউন্সিল আইডি জমা','Bar Verified':'বার কাউন্সিল যাচাইকৃত','Book a consultation first to add a lawyer.':'আইনজীবী যোগ করতে আগে একটি পরামর্শ বুক করুন।','Browse FAQs and guides':'প্রশ্নোত্তর ও নির্দেশিকা দেখুন','Case tools':'মামলার সরঞ্জাম','Changes to This Policy':'এই নীতির পরিবর্তন','Children':'শিশু','Choose text, phone, video, in-person, or document drafting. Pick a time that works for you.':'টেক্সট, ফোন, ভিডিও, সশরীরে বা দলিল খসড়া সেবা বেছে নিন। আপনার সুবিধাজনক সময় নির্বাচন করুন।','Client Awareness':'ক্লায়েন্ট সচেতনতা','Clients':'ক্লায়েন্টগণ','Code of Conduct':'আচরণবিধি','Commission':'কমিশন','Compliance with Bar Council Rules':'বার কাউন্সিলের বিধি মেনে চলা','Confidentiality':'গোপনীয়তা','Consultation Booking':'পরামর্শ বুকিং','Consultations':'পরামর্শসমূহ','Contact for Compliance Matters':'সম্মতি-সংক্রান্ত যোগাযোগ','Conversations':'কথোপকথন','Cookies':'কুকিজ','Create your free account and find the right lawyer today.':'বিনামূল্যে অ্যাকাউন্ট তৈরি করুন এবং আজই উপযুক্ত আইনজীবী খুঁজুন।','Data Protection Compliance':'তথ্য সুরক্ষা সম্মতি','Data Retention':'তথ্য সংরক্ষণ','Data Security':'তথ্য নিরাপত্তা','Describe the resolution...':'সমাধানের বিবরণ লিখুন...','Dispute':'বিরোধ','Dispute / Complaint':'বিরোধ / অভিযোগ','Document Upload':'দলিল আপলোড','Easy payouts':'সহজ পেমেন্ট উত্তোলন','Eligibility':'যোগ্যতা','Enrollment Verification':'নিবন্ধন যাচাই','Fee Structure and Commission':'ফি কাঠামো ও কমিশন','Fee Transparency':'ফির স্বচ্ছতা','File URL (demo)':'ফাইলের লিংক (ডেমো)','Fill in your details to set up your lawyer profile. You can edit these later.':'আইনজীবী প্রোফাইল তৈরি করতে আপনার তথ্য পূরণ করুন। পরে এগুলো সম্পাদনা করতে পারবেন।','Fill out the form below and our team will get back to you.':'নিচের ফর্মটি পূরণ করুন; আমাদের টিম আপনার সঙ্গে যোগাযোগ করবে।','Find a verified lawyer':'যাচাইকৃত আইনজীবী খুঁজুন','Find answers to common questions about using Amar Ain.':'আমার আইন ব্যবহারের সাধারণ প্রশ্নগুলোর উত্তর খুঁজুন।','Flexible Payments':'সহজ ও নমনীয় পেমেন্ট','For questions about these Terms, please contact us:':'এই শর্তাবলি সম্পর্কে প্রশ্ন থাকলে আমাদের সঙ্গে যোগাযোগ করুন:','Four simple steps to get the legal help you need.':'প্রয়োজনীয় আইনি সহায়তা পেতে চারটি সহজ ধাপ।','Get in touch with our support team.':'আমাদের সহায়তা টিমের সঙ্গে যোগাযোগ করুন।','Go to dashboard':'ড্যাশবোর্ডে যান','Governing Law':'প্রযোজ্য আইন','Gross merchandise value':'মোট লেনদেন মূল্য','Grow your practice with Amar Ain':'আমার আইনের সঙ্গে আপনার পেশাগত সেবা সম্প্রসারণ করুন','Handling Misconduct':'অসদাচরণ মোকাবিলা','Here\'s a summary of your legal activity.':'আপনার আইনি কার্যক্রমের সারসংক্ষেপ এখানে।','How Amar Ain Works':'আমার আইন কীভাবে কাজ করে','How We Use Your Information':'আমরা আপনার তথ্য কীভাবে ব্যবহার করি','How disputes work':'বিরোধ নিষ্পত্তি কীভাবে কাজ করে','How to raise and resolve disputes.':'কীভাবে বিরোধ উত্থাপন ও সমাধান করবেন।','How we collect, use, and protect your personal information on Amar Ain.':'আমার আইনে আমরা কীভাবে আপনার ব্যক্তিগত তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষা করি।','How we protect you at every step — from lawyer verification to secure payments and private messaging.':'আইনজীবী যাচাই থেকে নিরাপদ পেমেন্ট ও ব্যক্তিগত বার্তা—প্রতিটি ধাপে আমরা আপনাকে যেভাবে সুরক্ষা দিই।','I am a':'আমি একজন','If something goes wrong with a consultation, we\'re here to help resolve it fairly.':'পরামর্শে কোনো সমস্যা হলে ন্যায্যভাবে সমাধানে আমরা পাশে আছি।','If you encounter fraud, harassment, or any unsafe behavior, report it to us immediately. Our team reviews every report within 24 hours.':'প্রতারণা, হয়রানি বা অনিরাপদ আচরণের সম্মুখীন হলে সঙ্গে সঙ্গে জানান। আমাদের টিম ২৪ ঘণ্টার মধ্যে প্রতিটি প্রতিবেদন পর্যালোচনা করে।','Information Sharing':'তথ্য ভাগাভাগি','Information We Collect':'আমরা যে তথ্য সংগ্রহ করি','Intellectual Property':'মেধাস্বত্ব','Introduction':'ভূমিকা','Join 1,200+ verified lawyers serving clients across Bangladesh. Manage bookings, cases, earnings, and withdrawals — all in one place.':'বাংলাদেশজুড়ে ক্লায়েন্টদের সেবা দেওয়া ১,২০০-এর বেশি যাচাইকৃত আইনজীবীর সঙ্গে যুক্ত হন। বুকিং, মামলা, আয় ও উত্তোলন—সবকিছু এক জায়গা থেকে পরিচালনা করুন।','Join thousands of Bangladeshis who trust Amar Ain for their legal needs.':'আইনি প্রয়োজনে আমার আইনের ওপর আস্থা রাখা হাজারো বাংলাদেশির সঙ্গে যুক্ত হন।','Joined':'যোগদানের তারিখ','Lawyer Directory':'আইনজীবী তালিকা','Lawyer Verification Process':'আইনজীবী যাচাই প্রক্রিয়া','Lawyer payouts':'আইনজীবীর প্রাপ্য অর্থ','Limitation of Liability':'দায়বদ্ধতার সীমা','Live Chat':'লাইভ চ্যাট','Mediation':'মধ্যস্থতা','Message your lawyer securely, upload case documents, track progress, and rate your experience.':'নিরাপদে আইনজীবীকে বার্তা পাঠান, মামলার দলিল আপলোড করুন, অগ্রগতি দেখুন এবং অভিজ্ঞতার মূল্যায়ন করুন।','Need to raise a dispute?':'বিরোধ উত্থাপন করতে চান?','New clients':'নতুন ক্লায়েন্ট','No Unauthorized Practice':'অননুমোদিত আইনচর্চা নয়','No bookings found. You need a booking to raise a dispute.':'কোনো বুকিং পাওয়া যায়নি। বিরোধ উত্থাপনের জন্য একটি বুকিং প্রয়োজন।','No cases assigned':'কোনো মামলা বরাদ্দ নেই','No lawyer profile yet':'এখনও আইনজীবী প্রোফাইল নেই','No lawyers in this category':'এই বিভাগে কোনো আইনজীবী নেই','No open disputes':'কোনো খোলা বিরোধ নেই','No results found. Try a different search or':'কোনো ফল পাওয়া যায়নি। অন্যভাবে খুঁজুন অথবা','OTP Code':'ওটিপি কোড','Ongoing Monitoring':'চলমান পর্যবেক্ষণ','Our admin team will review your dispute within 48 hours. You can track its status in your dashboard.':'আমাদের অ্যাডমিন টিম ৪৮ ঘণ্টার মধ্যে আপনার বিরোধ পর্যালোচনা করবে। ড্যাশবোর্ডে এর অবস্থা দেখতে পারবেন।','Our compliance framework with the Bangladesh Bar Council regulations.':'বাংলাদেশ বার কাউন্সিলের বিধিমালার সঙ্গে আমাদের সম্মতি কাঠামো।','Our verification process consists of the following steps:':'আমাদের যাচাই প্রক্রিয়ায় নিম্নলিখিত ধাপগুলো রয়েছে:','Pay with bKash, Nagad, or SSLCommerz. Your payment is held safely until the consultation is completed.':'বিকাশ, নগদ বা এসএসএলকমার্জ দিয়ে পরিশোধ করুন। পরামর্শ সম্পন্ন না হওয়া পর্যন্ত আপনার অর্থ নিরাপদে সংরক্ষিত থাকবে।','Payment Data':'পেমেন্ট তথ্য','Payment Processing':'পেমেন্ট প্রক্রিয়াকরণ','Payments and Fees':'পেমেন্ট ও ফি','Pending verifications':'অপেক্ষমাণ যাচাই','Platform Services':'প্ল্যাটফর্মের সেবা','Platform health and key metrics.':'প্ল্যাটফর্মের অবস্থা ও প্রধান পরিসংখ্যান।','Platform safety guidelines':'প্ল্যাটফর্ম নিরাপত্তা নির্দেশিকা','Professional Independence':'পেশাগত স্বাধীনতা','Profile Data':'প্রোফাইলের তথ্য','Prohibited Conduct':'নিষিদ্ধ আচরণ','Promise':'প্রতিশ্রুতি','Raise or track a dispute':'বিরোধ উত্থাপন বা অগ্রগতি দেখুন','Rate your consultation':'আপনার পরামর্শের মূল্যায়ন করুন','Recent Reviews':'সাম্প্রতিক পর্যালোচনা','Response Time':'সাড়া দেওয়ার সময়','Revenue':'রাজস্ব','Review':'পর্যালোচনা','Review a consultation':'একটি পরামর্শ পর্যালোচনা করুন','Safety tips for clients':'ক্লায়েন্টদের জন্য নিরাপত্তা পরামর্শ','Search for help...':'সহায়তা খুঁজুন...','Share your experience...':'আপনার অভিজ্ঞতা লিখুন...','Status:':'অবস্থা:','Switch to English':'ইংরেজিতে পরিবর্তন করুন','Termination':'সমাপ্তি','The terms and conditions governing your use of Amar Ain.':'আমার আইন ব্যবহারের জন্য প্রযোজ্য শর্তাবলি।','Total':'মোট','Total bookings':'মোট বুকিং','Upcoming':'আসন্ন','Upload a link to your Bar Council registration certificate or practicing license.':'আপনার বার কাউন্সিল নিবন্ধন সনদ বা প্র্যাকটিসিং লাইসেন্সের লিংক দিন।','Usage Data':'ব্যবহারের তথ্য','Verification Check':'যাচাই পরীক্ষা','Verified badge':'যাচাইকৃত ব্যাজ','We collect the following categories of information:':'আমরা নিম্নলিখিত ধরনের তথ্য সংগ্রহ করি:','We review':'আমরা পর্যালোচনা করি','We\'re here to help. Reach out with any questions, concerns, or feedback.':'সহায়তার জন্য আমরা আছি। প্রশ্ন, উদ্বেগ বা মতামত নিয়ে যোগাযোগ করুন।','What you get':'আপনি যা পাবেন','You agree not to:':'আপনি নিম্নলিখিত কাজ না করতে সম্মত হচ্ছেন:','You can submit a dispute from your dashboard or directly here. Our team will review it promptly.':'ড্যাশবোর্ড থেকে অথবা সরাসরি এখানে বিরোধ জমা দিতে পারেন। আমাদের টিম দ্রুত তা পর্যালোচনা করবে।','You have the following rights regarding your personal data:':'আপনার ব্যক্তিগত তথ্য সম্পর্কে আপনার নিম্নলিখিত অধিকার রয়েছে:','Your Rights':'আপনার অধিকার','bKash / Nagad / SSLCommerz':'বিকাশ / নগদ / এসএসএলকমার্জ','contact us':'যোগাযোগ করুন','do not sell':'বিক্রি করি না','e.g. 30-min video consultation':'যেমন: ৩০ মিনিটের ভিডিও পরামর্শ','e.g. Dhaka':'যেমন: ঢাকা','e.g. Family Law':'যেমন: পারিবারিক আইন','e.g. How do I file for divorce?':'যেমন: বিবাহবিচ্ছেদের আবেদন কীভাবে করব?','e.g. Lawyer did not attend':'যেমন: আইনজীবী উপস্থিত হননি','e.g. Nikahnama.pdf':'যেমন: নিকাহনামা.pdf','e.g. Property dispute for Dhanmondi plot':'যেমন: ধানমন্ডির জমি নিয়ে সম্পত্তি বিরোধ','per session':'প্রতি সেশন','simplified':'সহজ ভাষায়','to':'থেকে','© 2026 Amar Ain. All rights reserved.':'© ২০২৬ আমার আইন। সর্বস্বত্ব সংরক্ষিত।'
};

const WORDS: Record<string, string> = {
  'search':'খুঁজুন','lawyer':'আইনজীবী','lawyers':'আইনজীবী','legal':'আইনি','information':'তথ্য','help':'সহায়তা','client':'ক্লায়েন্ট','clients':'ক্লায়েন্ট','admin':'অ্যাডমিন','user':'ব্যবহারকারী','users':'ব্যবহারকারী','booking':'বুকিং','bookings':'বুকিং','case':'মামলা','cases':'মামলা','payment':'পেমেন্ট','payments':'পেমেন্ট','message':'বার্তা','messages':'বার্তা','review':'পর্যালোচনা','reviews':'পর্যালোচনা','profile':'প্রোফাইল','service':'সেবা','services':'সেবা','status':'অবস্থা','pending':'অপেক্ষমাণ','completed':'সম্পন্ন','confirmed':'নিশ্চিত','cancelled':'বাতিল','open':'খোলা','closed':'বন্ধ','name':'নাম','phone':'ফোন','email':'ইমেইল','password':'পাসওয়ার্ড','date':'তারিখ','time':'সময়','amount':'পরিমাণ','fee':'ফি','total':'মোট','available':'উপলভ্য','verified':'যাচাইকৃত','language':'ভাষা','english':'ইংরেজি','bangla':'বাংলা','save':'সংরক্ষণ','delete':'মুছুন','edit':'সম্পাদনা','view':'দেখুন','add':'যোগ করুন','new':'নতুন','create':'তৈরি করুন','submit':'জমা দিন','send':'পাঠান','cancel':'বাতিল','yes':'হ্যাঁ','no':'না','all':'সব','none':'কোনোটিই নয়','support':'সহায়তা','contact':'যোগাযোগ','dashboard':'ড্যাশবোর্ড','account':'অ্যাকাউন্ট','logout':'লগ আউট','login':'লগ ইন','register':'নিবন্ধন','home':'হোম','details':'বিস্তারিত','description':'বিবরণ','category':'বিভাগ','location':'অবস্থান','rating':'রেটিং','experience':'অভিজ্ঞতা','year':'বছর','years':'বছর','document':'দলিল','documents':'দলিল','upload':'আপলোড','download':'ডাউনলোড','secure':'নিরাপদ','privacy':'গোপনীয়তা','terms':'শর্তাবলি','policy':'নীতি','report':'প্রতিবেদন','reports':'প্রতিবেদন','dispute':'বিরোধ','disputes':'বিরোধ','resolution':'সমাধান','active':'সক্রিয়','inactive':'নিষ্ক্রিয়','approved':'অনুমোদিত','rejected':'প্রত্যাখ্যাত','suspended':'স্থগিত','commission':'কমিশন','withdrawal':'উত্তোলন','earnings':'আয়','balance':'ব্যালেন্স','transaction':'লেনদেন','method':'পদ্ধতি','role':'ভূমিকা','actions':'কার্যক্রম','title':'শিরোনাম','body':'মূল লেখা','subject':'বিষয়','notes':'নোট','optional':'ঐচ্ছিক','required':'আবশ্যক','select':'নির্বাচন করুন','filter':'ফিল্টার','sort':'সাজান','reset':'রিসেট','more':'আরও','less':'কম','next':'পরবর্তী','previous':'পূর্ববর্তী','back':'ফিরুন','continue':'এগিয়ে যান','finish':'শেষ করুন','today':'আজ','tomorrow':'আগামীকাল','yesterday':'গতকাল','online':'অনলাইন','offline':'অফলাইন','video':'ভিডিও','audio':'অডিও','chat':'চ্যাট','call':'কল','meeting':'সাক্ষাৎ','consultation':'পরামর্শ','directory':'তালিকা','overview':'সারসংক্ষেপ','management':'ব্যবস্থাপনা','settings':'সেটিংস','verification':'যাচাই','content':'কনটেন্ট','article':'প্রবন্ধ','articles':'প্রবন্ধসমূহ','subscription':'সাবস্ক্রিপশন','subscriptions':'সাবস্ক্রিপশনসমূহ','refund':'অর্থ ফেরত','draft':'খসড়া','published':'প্রকাশিত','archive':'সংরক্ষণাগার','address':'ঠিকানা','city':'শহর','district':'জেলা','office':'চেম্বার','professional':'পেশাগত','basic':'মৌলিক','information':'তথ্য','general':'সাধারণ','technical':'প্রযুক্তিগত','issue':'সমস্যা','feedback':'মতামত','suggestion':'পরামর্শ','security':'নিরাপত্তা','activity':'কার্যক্রম','recent':'সাম্প্রতিক','upcoming':'আসন্ন','current':'বর্তমান','price':'মূল্য','duration':'সময়কাল','minute':'মিনিট','minutes':'মিনিট','session':'সেশন','per':'প্রতি','from':'থেকে','with':'সঙ্গে','without':'ছাড়া','and':'ও','or':'অথবা','of':'এর','for':'জন্য','in':'এ','on':'এ','by':'দ্বারা','your':'আপনার','our':'আমাদের','my':'আমার','the':'','a':'একটি','an':'একটি','is':'হলো','are':'হলো','not':'নয়','no':'কোনো','found':'পাওয়া গেছে','try':'চেষ্টা করুন','enter':'লিখুন','choose':'বেছে নিন','update':'হালনাগাদ করুন','manage':'পরিচালনা করুন','processing':'প্রক্রিয়াধীন','success':'সফল','error':'ত্রুটি','loading':'লোড হচ্ছে','welcome':'স্বাগতম','join':'যোগ দিন','learn':'জানুন','read':'পড়ুন','see':'দেখুন','start':'শুরু করুন','end':'শেষ','day':'দিন','week':'সপ্তাহ','month':'মাস','hour':'ঘণ্টা'
};

const ACRONYMS: Record<string, string> = {
  AI: 'এআই', API: 'এপিআই', BDT: 'টাকা', ID: 'আইডি', OTP: 'ওটিপি', PDF: 'পিডিএফ',
  FAQ: 'সাধারণ প্রশ্ন', FAQs: 'সাধারণ প্রশ্নসমূহ', SSLCommerz: 'এসএসএলকমার্জ', URL: 'লিংক',
  NID: 'এনআইডি', JWT: 'জেডব্লিউটি', SMS: 'এসএমএস', EN: 'ইংরেজি', AM: 'পূর্বাহ্ণ', PM: 'অপরাহ্ণ'
};

// Unknown English UI words are rendered phonetically in Bangla instead of being left in English.
// This is a final fallback; meaningful UI phrases should still be added to PHRASES/WORDS.
function transliterateEnglishWord(word: string): string {
  const direct = ACRONYMS[word] || ACRONYMS[word.toUpperCase()];
  if (direct) return direct;

  const lower = word.toLowerCase();
  const chunks: Array<[string, string]> = [
    ['tion','শন'],['sion','শন'],['ture','চার'],['ough','ও'],['eigh','এই'],['igh','আই'],
    ['ph','ফ'],['sh','শ'],['ch','চ'],['th','থ'],['wh','হো'],['qu','কু'],['ck','ক'],
    ['ng','ং'],['ee','ি'],['oo','ু'],['ea','ি'],['ai','ে'],['ay','ে'],['oi','য়'],
    ['ou','াউ'],['ow','াউ'],['au','অ'],['er','ার'],['or','র'],['ar','ার']
  ];
  const consonants: Record<string, string> = {
    b:'ব',c:'ক',d:'ড',f:'ফ',g:'গ',h:'হ',j:'জ',k:'ক',l:'ল',m:'ম',n:'ন',p:'প',q:'ক',r:'র',s:'স',t:'ট',v:'ভ',w:'ওয়',x:'ক্স',y:'য়',z:'জ'
  };
  const vowels: Record<string, string> = { a:'া',e:'ে',i:'ি',o:'ো',u:'ু' };
  let i = 0;
  let out = '';
  while (i < lower.length) {
    let matched = false;
    for (const [latin, bn] of chunks) {
      if (lower.startsWith(latin, i)) {
        out += bn;
        i += latin.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    const char = lower[i];
    if (consonants[char]) {
      out += consonants[char];
    } else if (vowels[char]) {
      // At the beginning, use an independent vowel; elsewhere use a vowel sign.
      const independent: Record<string, string> = { a:'আ',e:'এ',i:'ই',o:'ও',u:'উ' };
      out += i === 0 ? independent[char] : vowels[char];
    } else {
      out += char;
    }
    i += 1;
  }
  return out || word;
}

function translateText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed || !/[A-Za-z]/.test(trimmed)) return text;
  const exact = PHRASES[trimmed] || EXTRA_PHRASES[trimmed];
  if (exact) return text.replace(trimmed, exact);

  const out = trimmed.replace(/\b[A-Za-z][A-Za-z0-9'&+./-]*\b/g, (word) => {
    const cleaned = word.replace(/[0-9&+./-]+$/g, '');
    const suffix = word.slice(cleaned.length);
    const translated = WORDS[cleaned.toLowerCase()] || ACRONYMS[cleaned] || transliterateEnglishWord(cleaned);
    return translated + suffix;
  });
  return text.replace(trimmed, out);
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { session, profile, refreshProfile } = useAuth();
  const initial = (localStorage.getItem('amar_ain_language') || (profile as any)?.preferred_language || 'en') as Language;
  const [language, setLanguageState] = useState<Language>(initial === 'bn' ? 'bn' : 'en');

  const t = useCallback((text: string) => language === 'bn' ? translateText(text) : text, [language]);

  const setLanguage = useCallback(async (next: Language) => {
    setLanguageState(next);
    localStorage.setItem('amar_ain_language', next);
    document.documentElement.lang = next;
    document.documentElement.dataset.language = next;
    if (session?.user.id) {
      await supabase.from('profiles').update({ preferred_language: next }).eq('id', session.user.id);
      await refreshProfile();
    }
  }, [session?.user.id, refreshProfile]);

  const toggleLanguage = useCallback(() => setLanguage(language === 'en' ? 'bn' : 'en'), [language, setLanguage]);

  useEffect(() => {
    const saved = ((profile as any)?.preferred_language || localStorage.getItem('amar_ain_language')) as Language | null;
    if (saved && saved !== language) setLanguageState(saved);
  }, [(profile as any)?.preferred_language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;
    document.body.classList.toggle('font-bangla', language === 'bn');
    if (language !== 'bn') return;
    const translateNode = (root: ParentNode) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      while (walker.nextNode()) nodes.push(walker.currentNode as Text);
      for (const node of nodes) {
        const parent = node.parentElement;
        if (!parent || ['SCRIPT','STYLE','CODE','PRE'].includes(parent.tagName) || parent.closest('[data-no-translate]')) continue;
        const original = node.nodeValue || '';
        if (!node.parentElement?.dataset.originalText && /[A-Za-z]/.test(original)) node.parentElement!.dataset.originalText = original;
        node.nodeValue = translateText(original);
      }
      root.querySelectorAll?.('input, textarea, select, button, [title], [aria-label]').forEach((el: Element) => {
        const input = el as HTMLInputElement;
        if (input.placeholder) {
          if (!input.dataset.originalPlaceholder) input.dataset.originalPlaceholder = input.placeholder;
          input.placeholder = translateText(input.dataset.originalPlaceholder);
        }
        for (const attr of ['title','aria-label']) {
          const value = el.getAttribute(attr);
          if (value) el.setAttribute(attr, translateText(value));
        }
      });
    };
    translateNode(document.body);
    const observer = new MutationObserver((mutations) => mutations.forEach((m) => {
      if (m.type === 'characterData') {
        const n = m.target as Text;
        const translated = translateText(n.nodeValue || '');
        if (translated !== n.nodeValue) n.nodeValue = translated;
        return;
      }
      m.addedNodes.forEach((n) => {
        if (n.nodeType === Node.TEXT_NODE && n.parentElement) n.nodeValue = translateText(n.nodeValue || '');
        else if (n.nodeType === Node.ELEMENT_NODE) translateNode(n as Element);
      });
    }));
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);

  useEffect(() => {
    if (language === 'en') {
      document.querySelectorAll<HTMLElement>('[data-original-text]').forEach(el => {
        if (el.dataset.originalText && el.childNodes.length === 1 && el.firstChild?.nodeType === Node.TEXT_NODE) el.textContent = el.dataset.originalText;
        delete el.dataset.originalText;
      });
      document.querySelectorAll<HTMLInputElement>('[data-original-placeholder]').forEach(el => {
        if (el.dataset.originalPlaceholder) el.placeholder = el.dataset.originalPlaceholder;
      });
    }
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, toggleLanguage, t }), [language, setLanguage, toggleLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used within LanguageProvider');
  return value;
}

export function formatCurrency(amount: number, language: Language) {
  return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(value: string | Date, language: Language) {
  return new Intl.DateTimeFormat(language === 'bn' ? 'bn-BD' : 'en-BD', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

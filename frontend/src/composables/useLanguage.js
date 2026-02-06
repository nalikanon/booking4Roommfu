import { ref, computed } from 'vue';

const currentLanguage = ref(localStorage.getItem('app_lang') || 'TH');

const translations = {
  EN: {
    // --- Global ---
    back: "Back",
    logout: "Logout",
    
    // --- Login Page ---
    welcomeTitle: "Room Booking",
    welcomeSubtitle: "Mae Fah Luang University",
    loginInfo: "Welcome back! Please sign in to reserve a room.",
    loginBtn: "Login with MFU SSO",
    redirecting: "Redirecting...",
    footerRights: "© 2024 MFU Room Booking System",

    // --- Classroom List ---
    title: "Available Rooms",
    date: "Date:",
    time: "Time:",
    minCapacity: "Min Capacity:",
    searchPlaceholder: "Search room name...",
    bookNow: "Book Now",
    capacity: "Capacity:",
    building: "Building:",
    people: "People",
    confirmBookingTitle: "Confirm Booking",
    bookingFor: "Booking For (Subject)",
    bookingForPlaceholder: "e.g. Lecture Class 101",
    tel: "Tel",
    telPlaceholder: "Ext / Mobile",
    softwareNeeded: "Software Needed",
    noSoftware: "No Software",
    yesNeeded: "Yes, Needed",
    bookingDetails: "BOOKING DETAILS",
    cancel: "Cancel",
    confirm: "Confirm Booking",
    booking: "Booking...",
    successTitle: "Booking Confirmed!",
    successMsg: "You have successfully booked the room.",
    done: "Done",
    allBuildings: "All Buildings",

    // --- History Page ---
    historyTitle: "Booking History",
    loadingHistory: "Loading history...",
    noHistory: "No booking history found.",
    room: "Room"
  },
  TH: {
    // --- Global ---
    back: "กลับ",
    logout: "ออกจากระบบ",

    // --- Login Page ---
    welcomeTitle: "จองห้องเรียน",
    welcomeSubtitle: "มหาวิทยาลัยแม่ฟ้าหลวง",
    loginInfo: "ยินดีต้อนรับ! กรุณาเข้าสู่ระบบเพื่อทำการจองห้อง",
    loginBtn: "เข้าสู่ระบบด้วย MFU SSO",
    redirecting: "กำลังเข้าสู่ระบบ...",
    footerRights: "© 2024 ระบบจองห้อง MFU",

    // --- Classroom List ---
    title: "ห้องว่างที่จองได้",
    date: "วันที่:",
    time: "เวลา:",
    minCapacity: "ความจุขั้นต่ำ:",
    searchPlaceholder: "ค้นหาชื่อห้อง...",
    bookNow: "จองเลย",
    capacity: "ความจุ:",
    building: "อาคาร:",
    people: "คน",
    confirmBookingTitle: "ยืนยันการจอง",
    bookingFor: "หัวข้อการจอง",
    bookingForPlaceholder: "เช่น สอนชดเชยวิชา...",
    tel: "เบอร์ติดต่อ",
    telPlaceholder: "เบอร์ภายใน / มือถือ",
    softwareNeeded: "ต้องการลงโปรแกรม",
    noSoftware: "ไม่ต้องการ",
    yesNeeded: "ต้องการ",
    bookingDetails: "รายละเอียดการจอง",
    cancel: "ยกเลิก",
    confirm: "ยืนยันการจอง",
    booking: "กำลังบันทึก...",
    successTitle: "จองสำเร็จ!",
    successMsg: "ทำการจองห้องเรียบร้อยแล้ว",
    done: "ตกลง",
    allBuildings: "ทุกอาคาร",

    // --- History Page ---
    historyTitle: "ประวัติการจอง",
    loadingHistory: "กำลังโหลดข้อมูล...",
    noHistory: "ไม่พบประวัติการจอง",
    room: "ห้อง"
  }
};

export function useLanguage() {
  const t = computed(() => translations[currentLanguage.value]);

  const toggleLanguage = () => {
    currentLanguage.value = currentLanguage.value === 'TH' ? 'EN' : 'TH';
    localStorage.setItem('app_lang', currentLanguage.value);
  };

  return {
    currentLanguage,
    t,
    toggleLanguage
  };
}

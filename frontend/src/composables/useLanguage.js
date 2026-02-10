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

    // --- Select Room Page ---
    selectRoomTitle: "Select a Room Type",
    selectRoomSubtitle: "Choose the type of room you would like to book.",
    select: "Select",
    searchRoomTitle: "Search",
    selectDate: "Select Date",
    timeFrom: "Time From",
    timeTo: "Time To",
    searchBtn: "Search Available Rooms",
    cancelBtn: "Cancel",
    
    // Room Types
    classroomTitle: "Classroom",
    classroomDesc: "Standard classrooms equipped with projectors and whiteboards.",
    labTitle: "Laboratory",
    labDesc: "Computer labs and science labs with specialized equipment.",
    equipTitle: "Equipment Room",
    equipDesc: "Room for storing and checking out various equipment.",
    meetTitle: "Meeting Room",
    meetDesc: "Professional meeting spaces with conference facilities.",

    // --- History Page ---
    historyTitle: "Booking History",
    loadingHistory: "Loading history...",
    noHistory: "No booking history found.",
    room: "Room",
    confirmCancelTitle: "Cancel Booking",
    confirmCancelMsg: "Are you sure you want to cancel this booking? This action cannot be undone.",
    confirmYes: "Yes, Cancel",
    confirmNo: "No, Keep it",
    
    // Statuses
    statusPending: "Pending",
    statusApproved: "Approved",
    statusCancelled: "Cancelled",
    statusNotApproved: "Not Approved",
    statusUnknown: "Unknown"
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

    // --- Select Room Page ---
    selectRoomTitle: "เลือกประเภทห้อง",
    selectRoomSubtitle: "เลือกประเภทห้องที่คุณต้องการจอง",
    select: "เลือก",
    searchRoomTitle: "ค้นหาห้อง",
    selectDate: "เลือกวันที่",
    timeFrom: "เวลาเริ่ม",
    timeTo: "เวลาสิ้นสุด",
    searchBtn: "ค้นหาห้องว่าง",
    cancelBtn: "ยกเลิก",

    // Room Types
    classroomTitle: "ห้องเรียน",
    classroomDesc: "ห้องเรียนวิชาการทั่วไป พร้อมโปรเจคเตอร์และกระดานไวท์บอร์ด",
    labTitle: "ห้องปฏิบัติการ",
    labDesc: "ห้องคอมพิวเตอร์และห้องทดลองวิทยาศาสตร์ พร้อมอุปกรณ์เฉพาะทาง",
    equipTitle: "ห้องอุปกรณ์",
    equipDesc: "ห้องสำหรับเก็บและเบิกจ่ายอุปกรณ์ต่างๆ",
    meetTitle: "ห้องประชุม",
    meetDesc: "ห้องประชุมมาตรฐานระดับมืออาชีพ พร้อมสิ่งอำนวยความสะดวกครบครัน",

    // --- History Page ---
    historyTitle: "ประวัติการจอง",
    loadingHistory: "กำลังโหลดข้อมูล...",
    noHistory: "ไม่พบประวัติการจอง",
    room: "ห้อง",
    cancelBooking: "ยกเลิกการจอง",
    confirmCancelTitle: "ยืนยันการยกเลิก",
    confirmCancelMsg: "คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
    confirmYes: "ใช่, ยกเลิกเลย",
    confirmNo: "ไม่, ยกเลิก",

    // Statuses
    statusPending: "รอการอนุมัติ",
    statusApproved: "อนุมัติแล้ว",
    statusCancelled: "ยกเลิกแล้ว",
    statusNotApproved: "ไม่อนุมัติ",
    statusUnknown: "ไม่ทราบสถานะ"
  }
};

export function useLanguage() {
  const t = computed(() => {
    const lang = translations[currentLanguage.value] ? currentLanguage.value : 'TH';
    return translations[lang];
  });

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

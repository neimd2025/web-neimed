import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateCouponCodeByType, validateCouponCode } from "@/utils/coupon-generator"

export interface AdminUser {
  id: string
  name: string
  email: string
  role: "admin" | "super_admin"
  company: string
}

export interface Member {
  id: string
  name: string
  email: string
  company: string
  job: string
  joinDate: string
  lastActive: string
  status: "active" | "inactive"
  eventsParticipated: number
  profileViews: number
}

export interface EventFeedback {
  id: string
  eventId: string
  eventName: string
  memberId: string
  memberName: string
  rating: number
  feedback: string
  date: string
}

export interface Coupon {
  id: string
  code: string
  title: string
  description: string
  discount: string
  validUntil: string
  usageLimit: number
  usedCount: number
  status: "active" | "expired" | "disabled"
  type: "standard" | "premium" | "event"
  createdDate: string
}

export interface PushNotification {
  id: string
  title: string
  message: string
  targetType: "all" | "specific" | "event_participants"
  targetIds?: string[]
  sentDate: string
  deliveredCount: number
  readCount: number
}

interface AdminState {
  adminUser: AdminUser | null
  members: Member[]
  feedbacks: EventFeedback[]
  coupons: Coupon[]
  notifications: PushNotification[]
  isLoading: boolean
  
  // Actions
  adminLogin: (email: string, password: string) => Promise<boolean>
  adminLogout: () => void
  getMembers: () => void
  getFeedbacks: () => void
  createCoupon: (coupon: Omit<Coupon, "id" | "code" | "createdDate" | "usedCount">) => void
  createBatchCoupons: (couponData: Omit<Coupon, "id" | "code" | "createdDate" | "usedCount">, count: number) => void
  validateAndUseCoupon: (code: string, memberId: string) => { success: boolean; message: string; coupon?: Coupon }
  sendPushNotification: (notification: Omit<PushNotification, "id" | "sentDate" | "deliveredCount" | "readCount">) => void
  setLoading: (loading: boolean) => void
}

// 더미 데이터
const dummyAdmin: AdminUser = {
  id: "admin1",
  name: "관리자",
  email: "admin@neimd.com",
  role: "admin",
  company: "Neimd Network",
}

const dummyMembers: Member[] = [
  {
    id: "1",
    name: "허수정",
    email: "heosujeong@neimd.com",
    company: "Named",
    job: "기획자",
    joinDate: "2025-01-15",
    lastActive: "2025-01-20",
    status: "active",
    eventsParticipated: 3,
    profileViews: 167,
  },
  {
    id: "2",
    name: "김철수",
    email: "chulsoo@example.com",
    company: "스타트업XYZ",
    job: "개발자",
    joinDate: "2025-01-10",
    lastActive: "2025-01-19",
    status: "active",
    eventsParticipated: 2,
    profileViews: 89,
  },
  {
    id: "3",
    name: "이영희",
    email: "younghee@example.com",
    company: "디자인스튜디오",
    job: "UX 디자이너",
    joinDate: "2025-01-08",
    lastActive: "2025-01-18",
    status: "active",
    eventsParticipated: 4,
    profileViews: 234,
  },
]

const dummyFeedbacks: EventFeedback[] = [
  {
    id: "1",
    eventId: "event1",
    eventName: "Named 네트워킹 데모 이벤트",
    memberId: "1",
    memberName: "허수정",
    rating: 5,
    feedback: "정말 유익한 이벤트였습니다. 많은 사람들과 네트워킹할 수 있어서 좋았어요!",
    date: "2025-01-20",
  },
  {
    id: "2",
    eventId: "event1",
    eventName: "Named 네트워킹 데모 이벤트",
    memberId: "2",
    memberName: "김철수",
    rating: 4,
    feedback: "앱 사용법을 배울 수 있어서 도움이 되었습니다.",
    date: "2025-01-20",
  },
]

const sampleCoupons: Coupon[] = [
  {
    id: "1",
    code: "WELCOME-2025-NEW",
    title: "신규 회원 환영 쿠폰",
    description: "새로 가입한 회원을 위한 특별 할인 쿠폰",
    discount: "20% 할인",
    validUntil: "2025-03-31",
    usageLimit: 100,
    usedCount: 23,
    status: "active",
    type: "standard",
    createdDate: "2025-01-15",
  },
]

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      adminUser: null,
      members: dummyMembers,
      feedbacks: dummyFeedbacks,
      coupons: sampleCoupons,
      notifications: [],
      isLoading: false,

      adminLogin: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true })
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (email === "admin@neimd.com" && password === "admin123") {
          set({ adminUser: dummyAdmin, isLoading: false })
          return true
        }

        set({ isLoading: false })
        return false
      },

      adminLogout: () => {
        set({ adminUser: null })
      },

      getMembers: () => {
        set({ members: dummyMembers })
      },

      getFeedbacks: () => {
        set({ feedbacks: dummyFeedbacks })
      },

      createCoupon: (couponData: Omit<Coupon, "id" | "code" | "createdDate" | "usedCount">) => {
        const couponCode = generateCouponCodeByType(couponData.type)
        const newCoupon: Coupon = {
          ...couponData,
          id: Date.now().toString(),
          code: couponCode,
          createdDate: new Date().toISOString().split("T")[0],
          usedCount: 0,
        }
        set((state) => ({ coupons: [...state.coupons, newCoupon] }))
      },

      createBatchCoupons: (couponData: Omit<Coupon, "id" | "code" | "createdDate" | "usedCount">, count: number) => {
        const newCoupons: Coupon[] = []

        for (let i = 0; i < count; i++) {
          const couponCode = generateCouponCodeByType(couponData.type)
          const newCoupon: Coupon = {
            ...couponData,
            id: `${Date.now()}-${i}`,
            code: couponCode,
            title: `${couponData.title} #${i + 1}`,
            createdDate: new Date().toISOString().split("T")[0],
            usedCount: 0,
          }
          newCoupons.push(newCoupon)
        }

        set((state) => ({ coupons: [...state.coupons, ...newCoupons] }))
      },

      validateAndUseCoupon: (code: string, memberId: string): { success: boolean; message: string; coupon?: Coupon } => {
        const { coupons } = get()
        
        // 쿠폰 코드 형식 검증
        if (!validateCouponCode(code) && !code.startsWith("PREMIUM-") && !code.startsWith("EVENT-")) {
          return { success: false, message: "유효하지 않은 쿠폰 코드 형식입니다." }
        }

        // 쿠폰 찾기
        const coupon = coupons.find((c) => c.code === code)
        if (!coupon) {
          return { success: false, message: "존재하지 않는 쿠폰 코드입니다." }
        }

        // 쿠폰 상태 확인
        if (coupon.status !== "active") {
          return { success: false, message: "사용할 수 없는 쿠폰입니다." }
        }

        // 사용 한도 확인
        if (coupon.usedCount >= coupon.usageLimit) {
          return { success: false, message: "쿠폰 사용 한도가 초과되었습니다." }
        }

        // 유효기간 확인
        const today = new Date().toISOString().split("T")[0]
        if (today > coupon.validUntil) {
          return { success: false, message: "쿠폰 유효기간이 만료되었습니다." }
        }

        // 쿠폰 사용 처리
        set((state) => ({
          coupons: state.coupons.map((c) => 
            c.id === coupon.id ? { ...c, usedCount: c.usedCount + 1 } : c
          )
        }))

        return {
          success: true,
          message: `쿠폰이 성공적으로 사용되었습니다! ${coupon.discount} 혜택을 받으세요.`,
          coupon,
        }
      },

      sendPushNotification: (notificationData: Omit<PushNotification, "id" | "sentDate" | "deliveredCount" | "readCount">) => {
        const { members } = get()
        const newNotification: PushNotification = {
          ...notificationData,
          id: Date.now().toString(),
          sentDate: new Date().toISOString().split("T")[0],
          deliveredCount: notificationData.targetType === "all" ? members.length : notificationData.targetIds?.length || 0,
          readCount: 0,
        }
        set((state) => ({ notifications: [...state.notifications, newNotification] }))
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'named_admin', // localStorage key
      partialize: (state) => ({ adminUser: state.adminUser }), // 관리자 정보만 저장
    }
  )
)
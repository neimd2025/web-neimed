import { Database } from '@/types/supabase'
import { createClient } from '@/utils/supabase/client'

type Tables = Database['public']['Tables']
type UserProfile = Tables['user_profiles']['Row']
type UserProfileInsert = Tables['user_profiles']['Insert']
type UserProfileUpdate = Tables['user_profiles']['Update']

type Event = Tables['events']['Row']
type EventInsert = Tables['events']['Insert']
type EventUpdate = Tables['events']['Update']

type BusinessCard = Tables['business_cards']['Row']
type BusinessCardInsert = Tables['business_cards']['Insert']
type BusinessCardUpdate = Tables['business_cards']['Update']

type CollectedCard = Tables['collected_cards']['Row']
type CollectedCardInsert = Tables['collected_cards']['Insert']

type Notification = Tables['notifications']['Row']
type NotificationInsert = Tables['notifications']['Insert']

// 사용자 프로필 관련 함수들
export const userProfileAPI = {
  // 사용자 프로필 가져오기
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)

      // 프로필이 없는 경우 자동으로 생성
      if (error.code === 'PGRST116') {
        console.log('Creating new user profile for:', userId)
        const newProfile: UserProfileInsert = {
          id: userId,
          name: '',
          email: '',
          phone: '',
          company: '',
          position: '',
          bio: '',
          mbti: '',
          keywords: [],
          profile_image_url: null,
          is_public: true
        }

        return await this.createUserProfile(newProfile)
      }

      return null
    }

    return data
  },

  // 사용자 프로필 생성
  async createUserProfile(profile: UserProfileInsert): Promise<UserProfile | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      return null
    }

    return data
  },

  // 사용자 프로필 업데이트
  async updateUserProfile(userId: string, updates: UserProfileUpdate): Promise<UserProfile | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      return null
    }

    return data
  },

  // 사용자 프로필 삭제
  async deleteUserProfile(userId: string): Promise<boolean> {
    const supabase = createClient()

    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('Error deleting user profile:', error)
      return false
    }

    return true
  }
}

// 이벤트 관련 함수들
export const eventAPI = {
  // 모든 이벤트 가져오기
  async getAllEvents(): Promise<Event[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching events:', error)
      return []
    }

    return data || []
  },

  // 특정 이벤트 가져오기
  async getEvent(eventId: string): Promise<Event | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (error) {
      console.error('Error fetching event:', error)
      return null
    }

    return data
  },

  // 이벤트 코드로 이벤트 찾기
  async getEventByCode(eventCode: string): Promise<Event | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('event_code', eventCode)
      .single()

    if (error) {
      console.error('Error fetching event by code:', error)
      return null
    }

    return data
  },

  // 이벤트 생성
  async createEvent(event: EventInsert): Promise<Event | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('events')
      .insert(event)
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return null
    }

    return data
  },

  // 이벤트 업데이트
  async updateEvent(eventId: string, updates: EventUpdate): Promise<Event | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single()

    if (error) {
      console.error('Error updating event:', error)
      return null
    }

    return data
  },

  // 이벤트 삭제
  async deleteEvent(eventId: string): Promise<boolean> {
    const supabase = createClient()

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error('Error deleting event:', error)
      return false
    }

    return true
  }
}

// 명함 관련 함수들
export const businessCardAPI = {
  // 사용자 비즈니스 카드 가져오기
  async getUserBusinessCard(userId: string): Promise<BusinessCard | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('business_cards')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching business card:', error)

      // 비즈니스 카드가 없는 경우 자동으로 생성
      if (error.code === 'PGRST116') {
        console.log('Creating new business card for:', userId)
        const newCard: BusinessCardInsert = {
          user_id: userId,
          name: '',
          email: '',
          phone: '',
          company: '',
          position: '',
          bio: '',
          profile_image_url: null,
          qr_code_url: null,
          is_public: true
        }

        return await this.createBusinessCard(newCard)
      }

      return null
    }

    return data
  },

  // 공개 명함 가져오기
  async getPublicBusinessCard(cardId: string): Promise<BusinessCard | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('business_cards')
      .select('*')
      .eq('id', cardId)
      .eq('is_public', true)
      .single()

    if (error) {
      console.error('Error fetching public business card:', error)
      return null
    }

    return data
  },

  // 명함 생성
  async createBusinessCard(card: BusinessCardInsert): Promise<BusinessCard | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('business_cards')
      .insert(card)
      .select()
      .single()

    if (error) {
      console.error('Error creating business card:', error)
      return null
    }

    return data
  },

  // 명함 업데이트
  async updateBusinessCard(cardId: string, updates: BusinessCardUpdate): Promise<BusinessCard | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('business_cards')
      .update(updates)
      .eq('id', cardId)
      .select()
      .single()

    if (error) {
      console.error('Error updating business card:', error)
      return null
    }

    return data
  },

  // 명함 삭제
  async deleteBusinessCard(cardId: string): Promise<boolean> {
    const supabase = createClient()

    const { error } = await supabase
      .from('business_cards')
      .delete()
      .eq('id', cardId)

    if (error) {
      console.error('Error deleting business card:', error)
      return false
    }

    return true
  }
}

// 수집된 명함 관련 함수들
export const collectedCardAPI = {
  // 사용자가 수집한 명함 목록 가져오기
  async getUserCollectedCards(userId: string): Promise<CollectedCard[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('collected_cards')
      .select(`
        *,
        business_cards (*)
      `)
      .eq('collector_id', userId)
      .order('collected_at', { ascending: false })

    if (error) {
      console.error('Error fetching collected cards:', error)
      return []
    }

    return data || []
  },

  // 명함 수집
  async collectCard(collection: CollectedCardInsert): Promise<CollectedCard | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('collected_cards')
      .insert(collection)
      .select()
      .single()

    if (error) {
      console.error('Error collecting card:', error)
      return null
    }

    return data
  },

  // 즐겨찾기 토글
  async toggleFavorite(collectionId: string, isFavorite: boolean): Promise<boolean> {
    const supabase = createClient()

    const { error } = await supabase
      .from('collected_cards')
      .update({ is_favorite: isFavorite })
      .eq('id', collectionId)

    if (error) {
      console.error('Error toggling favorite:', error)
      return false
    }

    return true
  },

  // 수집된 명함 삭제
  async removeCollectedCard(collectionId: string): Promise<boolean> {
    const supabase = createClient()

    const { error } = await supabase
      .from('collected_cards')
      .delete()
      .eq('id', collectionId)

    if (error) {
      console.error('Error removing collected card:', error)
      return false
    }

    return true
  }
}

// 알림 관련 함수들
export const notificationAPI = {
  // 사용자 알림 가져오기
  async getUserNotifications(userId: string): Promise<Notification[]> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`target_type.eq.all,target_ids.cs.{${userId}}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }

    return data || []
  },

  // 알림 생성
  async createNotification(notification: NotificationInsert): Promise<Notification | null> {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return null
    }

    return data
  },

  // 알림 읽음 처리
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const supabase = createClient()

    const { error } = await supabase
      .from('notifications')
      .update({ read_count: supabase.sql`read_count + 1` })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
      return false
    }

    return true
  }
}

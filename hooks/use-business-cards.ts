import { businessCardAPI, collectedCardAPI } from '@/lib/supabase/database'
import { Database } from '@/types/supabase'
import { useEffect, useState } from 'react'
import { useAuth } from './use-auth'

type BusinessCard = Database['public']['Tables']['business_cards']['Row']
type BusinessCardInsert = Database['public']['Tables']['business_cards']['Insert']
type CollectedCard = {
  id: string
  card_id: string | null
  collector_id: string | null
  collected_at: string | null
  is_favorite: boolean | null
  memo?: string | null
  business_cards: BusinessCard | null
}

export const useBusinessCards = () => {
  const { user } = useAuth()
  const [userCard, setUserCard] = useState<BusinessCard | null>(null)
  const [collectedCards, setCollectedCards] = useState<CollectedCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 사용자 명함 로드
  const loadUserCard = async () => {
    if (!user?.id) {
      setUserCard(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const card = await businessCardAPI.getUserBusinessCard(user.id)

      if (card) {
        setUserCard(card)
      } else {
        // 명함이 없는 경우 null로 설정 (오류가 아님)
        setUserCard(null)
        console.log('사용자 명함이 아직 생성되지 않았습니다.')
      }
    } catch (err) {
      console.error('Error loading user card:', err)
      setError('명함을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 수집된 명함 로드
  const loadCollectedCards = async () => {
    if (!user?.id) {
      setCollectedCards([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const cards = await collectedCardAPI.getUserCollectedCards(user.id)
      setCollectedCards(cards as CollectedCard[])
    } catch (err) {
      console.error('Error loading collected cards:', err)
      setError('수집된 명함을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 명함 생성
  const createBusinessCard = async (cardData: BusinessCardInsert) => {
    if (!user?.id) {
      throw new Error('사용자가 로그인되지 않았습니다.')
    }

    try {
      setLoading(true)
      setError(null)

      const newCard = await businessCardAPI.createBusinessCard({
        ...cardData,
        user_id: user.id
      })

      if (newCard) {
        setUserCard(newCard)
        return newCard
      } else {
        throw new Error('명함 생성에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error creating business card:', err)
      setError('명함 생성에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 명함 업데이트
  const updateBusinessCard = async (cardId: string, updates: Partial<BusinessCard>) => {
    try {
      setLoading(true)
      setError(null)

      // 클라이언트에서 직접 업데이트
      const updatedCard = await businessCardAPI.updateBusinessCard(cardId, updates)

      if (updatedCard) {
        if (userCard?.id === cardId) {
          setUserCard(updatedCard)
        }
        return updatedCard
      } else {
        throw new Error('명함 업데이트에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error updating business card:', err)
      setError('명함 업데이트에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 명함 삭제
  const deleteBusinessCard = async (cardId: string) => {
    try {
      setLoading(true)
      setError(null)

      const success = await businessCardAPI.deleteBusinessCard(cardId)

      if (success) {
        if (userCard?.id === cardId) {
          setUserCard(null)
        }
        return true
      } else {
        throw new Error('명함 삭제에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error deleting business card:', err)
      setError('명함 삭제에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 공개 명함 가져오기
  const getPublicCard = async (cardId: string) => {
    try {
      setLoading(true)
      setError(null)

      const card = await businessCardAPI.getPublicBusinessCard(cardId)
      return card
    } catch (err) {
      console.error('Error loading public card:', err)
      setError('명함을 불러오는데 실패했습니다.')
      return null
    } finally {
      setLoading(false)
    }
  }

  // 명함 수집
  const collectCard = async (cardId: string, memo?: string) => {
    if (!user?.id) {
      throw new Error('사용자가 로그인되지 않았습니다.')
    }

    try {
      setLoading(true)
      setError(null)

      const collection = await collectedCardAPI.collectCard({
        collector_id: user.id,
        card_id: cardId
      })

      if (collection) {
        setCollectedCards(prev => [collection as CollectedCard, ...prev])
        return collection
      } else {
        throw new Error('명함 수집에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error collecting card:', err)
      setError('명함 수집에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 즐겨찾기 토글
  const toggleFavorite = async (collectionId: string, isFavorite: boolean) => {
    try {
      setLoading(true)
      setError(null)

      const success = await collectedCardAPI.toggleFavorite(collectionId, isFavorite)

      if (success) {
        setCollectedCards(prev =>
          prev.map(card =>
            card.id === collectionId
              ? { ...card, is_favorite: isFavorite }
              : card
          )
        )
        return true
      } else {
        throw new Error('즐겨찾기 변경에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error toggling favorite:', err)
      setError('즐겨찾기 변경에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 수집된 명함 삭제
  const removeCollectedCard = async (collectionId: string) => {
    try {
      setLoading(true)
      setError(null)

      const success = await collectedCardAPI.removeCollectedCard(collectionId)

      if (success) {
        setCollectedCards(prev => prev.filter(card => card.id !== collectionId))
        return true
      } else {
        throw new Error('수집된 명함 삭제에 실패했습니다.')
      }
    } catch (err) {
      console.error('Error removing collected card:', err)
      setError('수집된 명함 삭제에 실패했습니다.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 즐겨찾기된 명함만 필터링
  const favoriteCards = collectedCards.filter(card => card.is_favorite)

  // 초기 로드
  useEffect(() => {
    loadUserCard()
    loadCollectedCards()
  }, [user?.id])

  return {
    userCard,
    collectedCards,
    favoriteCards,
    loading,
    error,
    loadUserCard,
    loadCollectedCards,
    createBusinessCard,
    updateBusinessCard,
    deleteBusinessCard,
    getPublicCard,
    collectCard,
    toggleFavorite,
    removeCollectedCard
  }
}

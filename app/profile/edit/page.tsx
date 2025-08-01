'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserProfile } from '@/hooks/use-user-profile'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { ArrowLeft, Camera, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

// Zod 스키마 정의
const profileSchema = z.object({
  full_name: z.string().min(2, '이름은 2자 이상이어야 합니다').max(50, '이름은 50자 이하여야 합니다'),
  birth_date: z.string().optional().refine((val) => {
    if (!val || val === '') return true
    if (val === '123123123') return false
    const date = new Date(val)
    return !isNaN(date.getTime())
  }, '올바른 날짜 형식을 입력해주세요'),
  affiliation: z.string().max(100, '소속은 100자 이하여야 합니다'),
  company: z.string().max(100, '회사명은 100자 이하여야 합니다'),
  role: z.string().max(100, '직책은 100자 이하여야 합니다'),
  contact: z.string().max(100, '연락처는 100자 이하여야 합니다'),
  mbti: z.string().optional(),
  keywords: z.array(z.string()).max(3, '성격 키워드는 최대 3개까지 선택할 수 있습니다'),
  introduction: z.string().max(500, '자기소개는 500자 이하여야 합니다'),
  external_link: z.string().url('올바른 URL 형식을 입력해주세요').optional().or(z.literal(''))
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function EditProfilePage() {
  const router = useRouter()
  const { profile, updateProfile, loading } = useUserProfile()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      birth_date: '',
      affiliation: '',
      company: '',
      role: '',
      contact: '',
      mbti: '',
      keywords: [],
      introduction: '',
      external_link: ''
    }
  })

  // 기존 프로필 데이터 로드
  useEffect(() => {
    if (profile) {
      setValue('full_name', profile.full_name || '')
      setValue('birth_date', profile.birth_date || '')
      setValue('affiliation', profile.affiliation || '')
      setValue('company', profile.company || '')
      setValue('role', profile.role || '')
      setValue('contact', profile.contact || '')
      setValue('mbti', profile.mbti || '')
      setValue('keywords', profile.keywords || [])
      setValue('introduction', profile.introduction || '')
      setValue('external_link', profile.external_link || '')
    }
  }, [profile, setValue])

  const mbtiTypes = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ]

  const personalityOptions = [
    '낯가림이 있어요', '사람들과 잘 어울려요', '호기심이 많아요', '조용한 편이에요',
    '에너지가 많은 편이에요', '계획을 세우는 걸 좋아해요', '즉흥적으로 움직이는 편이에요',
    '리더보다 서포터가 편해요', '공감을 잘하는 편이에요', '혼자 있는 시간을 좋아해요',
    '말보다 글이 더 편해요', '꼼곰한 편이에요', '감성적인 편이에요', '솔직하게 말하는 편이에요',
    '새로운 아이디어를 자주 떠올려요'
  ]

  const onSubmit = async (data: ProfileFormData) => {
    if (!profile) {
      toast.error('프로필을 불러올 수 없습니다.')
      return
    }

    try {
      // 빈 문자열들을 null로 변환
      const cleanedData = {
        full_name: data.full_name,
        birth_date: data.birth_date || null,
        affiliation: data.affiliation || null,
        company: data.company || null,
        role: data.role || null,
        contact: data.contact || null,
        mbti: data.mbti || null,
        keywords: data.keywords.length > 0 ? data.keywords : null,
        introduction: data.introduction || null,
        external_link: data.external_link || null
      }

      await updateProfile(cleanedData)

      toast.success('프로필이 성공적으로 수정되었습니다!')
      router.push('/my-page')
    } catch (error) {
      console.error('프로필 수정 오류:', error)
      toast.error('프로필 수정에 실패했습니다.')
    }
  }

  const handleMBTISelect = (mbti: string) => {
    setValue('mbti', mbti)
  }

  const handlePersonalityToggle = (personality: string) => {
    const currentKeywords = watch('keywords')
    const newKeywords = currentKeywords.includes(personality)
      ? currentKeywords.filter(p => p !== personality)
      : currentKeywords.length < 3
        ? [...currentKeywords, personality]
        : currentKeywords
    setValue('keywords', newKeywords)
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <Link href="/my-page">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4 text-gray-900" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">프로필 수정</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="px-5 py-6">
        {loading ? (
          // 로딩 스켈레톤
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
            </div>

            <div className="text-center mb-8">
              <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
            </div>

            <div className="space-y-6">
              {[...Array(8)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto"
          >
            {/* 프로필 사진 섹션 */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center relative">
                <User className="w-12 h-12 text-gray-600" />
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 hover:bg-purple-700 rounded-full"
                >
                  <Camera className="w-4 h-4 text-white" />
                </Button>
              </div>
              <p className="text-purple-600 text-sm font-medium">프로필 사진 추가(선택)</p>
            </div>

            {/* 제목과 설명 */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">프로필 수정</h2>
              <p className="text-gray-600">명함 정보를 수정하세요</p>
            </div>

            {/* 입력 폼 */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 *
                </label>
                <Input
                  {...register('full_name')}
                  placeholder="이름을 입력하세요"
                  className={errors.full_name ? 'border-red-500' : ''}
                />
                {errors.full_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
                )}
              </div>

              {/* 생년월일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  생년월일
                </label>
                <Input
                  {...register('birth_date')}
                  type="date"
                  className={errors.birth_date ? 'border-red-500' : ''}
                />
                {errors.birth_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.birth_date.message}</p>
                )}
              </div>

              {/* 소속 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  소속
                </label>
                <Input
                  {...register('affiliation')}
                  placeholder="소속을 입력하세요"
                  className={errors.affiliation ? 'border-red-500' : ''}
                />
                {errors.affiliation && (
                  <p className="text-red-500 text-sm mt-1">{errors.affiliation.message}</p>
                )}
              </div>

              {/* 회사 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회사
                </label>
                <Input
                  {...register('company')}
                  placeholder="회사명을 입력하세요"
                  className={errors.company ? 'border-red-500' : ''}
                />
                {errors.company && (
                  <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>
                )}
              </div>

              {/* 직책 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  직책
                </label>
                <Input
                  {...register('role')}
                  placeholder="직책을 입력하세요"
                  className={errors.role ? 'border-red-500' : ''}
                />
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
                )}
              </div>

              {/* 연락처 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  연락처
                </label>
                <Input
                  {...register('contact')}
                  placeholder="연락처를 입력하세요"
                  className={errors.contact ? 'border-red-500' : ''}
                />
                {errors.contact && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact.message}</p>
                )}
              </div>

              {/* MBTI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MBTI
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {mbtiTypes.map((mbti) => (
                    <Button
                      key={mbti}
                      type="button"
                      variant={watch('mbti') === mbti ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleMBTISelect(mbti)}
                      className="text-xs"
                    >
                      {mbti}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 성격 키워드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  성격 키워드 (최대 3개)
                </label>
                <div className="flex flex-wrap gap-2">
                  {personalityOptions.map((personality) => (
                    <Badge
                      key={personality}
                      variant={watch('keywords').includes(personality) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handlePersonalityToggle(personality)}
                    >
                      {personality}
                    </Badge>
                  ))}
                </div>
                {errors.keywords && (
                  <p className="text-red-500 text-sm mt-1">{errors.keywords.message}</p>
                )}
              </div>

              {/* 자기소개 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자기소개
                </label>
                <textarea
                  {...register('introduction')}
                  rows={4}
                  placeholder="자기소개를 입력하세요"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.introduction ? 'border-red-500' : ''
                  }`}
                />
                {errors.introduction && (
                  <p className="text-red-500 text-sm mt-1">{errors.introduction.message}</p>
                )}
              </div>

              {/* 외부 링크 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  외부 링크
                </label>
                <Input
                  {...register('external_link')}
                  placeholder="https://example.com"
                  className={errors.external_link ? 'border-red-500' : ''}
                />
                {errors.external_link && (
                  <p className="text-red-500 text-sm mt-1">{errors.external_link.message}</p>
                )}
              </div>

              {/* 제출 버튼 */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium"
              >
                {isSubmitting ? '저장 중...' : '프로필 저장'}
              </Button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  )
}

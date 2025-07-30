'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { ArrowLeft, Camera, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    affiliation: '',
    company: '',
    role: '',
    contact: '',
    mbti: '',
    personality: [] as string[],
    interests: [] as string[],
    introduction: '',
    externalLink: ''
  })

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

  const interestOptions = [
    '인공지능', '창업', '퍼스널 브랜딩', '콘텐츠 제작', '자기계발', '지속가능성',
    '사회적기업', '젠더/다양성', '교환/유학', '감정표현', '전시/예술', '문학/에세이',
    'SNS/커뮤니티', '교육격차', '진로탐색'
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleMBTISelect = (mbti: string) => {
    setFormData(prev => ({ ...prev, mbti }))
  }

  const handlePersonalityToggle = (personality: string) => {
    setFormData(prev => {
      const newPersonality = prev.personality.includes(personality)
        ? prev.personality.filter(p => p !== personality)
        : prev.personality.length < 3
          ? [...prev.personality, personality]
          : prev.personality
      return { ...prev, personality: newPersonality }
    })
  }

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => {
      const newInterests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : prev.interests.length < 3
          ? [...prev.interests, interest]
          : prev.interests
      return { ...prev, interests: newInterests }
    })
  }

  const handleSubmit = () => {
    console.log('프로필 수정 완료:', formData)
    // 여기서 API 호출하여 데이터 저장
    alert('프로필이 성공적으로 수정되었습니다!')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <Link href="/my-namecard">
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
          <div className="space-y-6">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">이름 *</label>
              <Input
                placeholder="실명을 입력하세요"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full"
              />
            </div>

            {/* 생년월일 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">생년월일</label>
              <Input
                placeholder="예: 055975"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="w-full"
              />
            </div>

            {/* 소속 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">소속</label>
              <div className="flex gap-3">
                <Button
                  variant={formData.affiliation === '소속' ? 'default' : 'outline'}
                  onClick={() => handleInputChange('affiliation', '소속')}
                  className="flex-1"
                >
                  소속
                </Button>
                <Button
                  variant={formData.affiliation === '미소속' ? 'default' : 'outline'}
                  onClick={() => handleInputChange('affiliation', '미소속')}
                  className="flex-1"
                >
                  미소속
                </Button>
              </div>
            </div>

            {/* 소속명 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">소속</label>
              <Input
                placeholder="예: 네이버"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full"
              />
            </div>

            {/* 역할 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">역할</label>
              <Input
                placeholder="예: 마케팅"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full"
              />
            </div>

            {/* 연락처 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                연락처나 카카오톡 아이디(선택)
              </label>
              <Input
                placeholder="번호의 경우 숫자만 입력하세요"
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                className="w-full"
              />
            </div>

            {/* MBTI */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">MBTI (선택)</label>
              <div className="grid grid-cols-4 gap-2">
                {mbtiTypes.map((mbti) => (
                  <Button
                    key={mbti}
                    variant={formData.mbti === mbti ? 'default' : 'outline'}
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
              <label className="block text-sm font-medium text-gray-900 mb-3">
                성격 키워드 * (최소 1개, 최대 3개)
              </label>
              <div className="flex flex-wrap gap-2">
                {personalityOptions.map((option) => (
                  <Badge
                    key={option}
                    variant={formData.personality.includes(option) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handlePersonalityToggle(option)}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 관심 키워드 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                관심 키워드 (선택, 최대 3개)
              </label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((option) => (
                  <Badge
                    key={option}
                    variant={formData.interests.includes(option) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleInterestToggle(option)}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 자기소개 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                자기소개 한줄 (선택)
              </label>
              <Input
                placeholder=""
                value={formData.introduction}
                onChange={(e) => handleInputChange('introduction', e.target.value)}
                className="w-full"
              />
            </div>

            {/* 외부 링크 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                대표 외부 링크 (선택)
              </label>
              <Input
                placeholder=""
                value={formData.externalLink}
                onChange={(e) => handleInputChange('externalLink', e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 py-6 shadow-lg">
        <Button
          onClick={handleSubmit}
          className="w-full h-15 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg"
        >
          수정 완료
        </Button>
      </div>
    </div>
  )
}

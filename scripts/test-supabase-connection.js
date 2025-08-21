#!/usr/bin/env node

// Supabase 연결 테스트 스크립트
const fs = require('fs')
const path = require('path')

// .env 파일 수동 로드
const envPath = path.join(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
      process.env[key.trim()] = value.trim()
    }
  })
}

const { createClient } = require('@supabase/supabase-js')

async function testSupabaseConnection() {
  console.log('🔍 Supabase 연결 테스트를 시작합니다...\n')

  // 환경변수 확인
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  console.log('📋 환경변수 설정 상태:')
  console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅ 설정됨' : '❌ 누락'}`)
  console.log(`   SUPABASE_KEY: ${supabaseKey ? '✅ 설정됨' : '❌ 누락'}`)
  console.log(`   SITE_URL: ${siteUrl ? '✅ 설정됨' : '❌ 누락'}`)
  console.log()

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ 필수 환경변수가 누락되었습니다.')
    return
  }

  try {
    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    console.log('🔗 Supabase 클라이언트 생성 완료')
    
    // 기본 연결 테스트
    console.log('📡 데이터베이스 연결 테스트 중...')
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ 데이터베이스 연결 실패:', error.message)
    } else {
      console.log('✅ 데이터베이스 연결 성공')
    }

    // Auth 설정 확인
    console.log('🔐 인증 설정 확인 중...')
    
    // 현재 세션 확인
    const { data: session, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('❌ 세션 확인 실패:', sessionError.message)
    } else {
      console.log('✅ 인증 시스템 작동 중')
      console.log(`   현재 로그인 상태: ${session.session ? '로그인됨' : '로그인되지 않음'}`)
    }

    // OAuth Provider 설정 확인을 위한 정보 출력
    console.log('\n🔧 OAuth 설정 정보:')
    console.log(`   프로젝트 URL: ${supabaseUrl}`)
    console.log(`   Redirect URL: ${supabaseUrl}/auth/v1/callback`)
    console.log(`   Site URL: ${siteUrl}`)
    
    console.log('\n📝 Google Cloud Console에서 설정해야 할 Authorized redirect URIs:')
    console.log(`   ${supabaseUrl}/auth/v1/callback`)
    
    console.log('\n📝 Google Cloud Console에서 설정해야 할 Authorized JavaScript origins:')
    console.log(`   ${siteUrl}`)
    console.log(`   ${supabaseUrl}`)

  } catch (error) {
    console.log('❌ 연결 테스트 중 오류 발생:', error.message)
  }
}

testSupabaseConnection()
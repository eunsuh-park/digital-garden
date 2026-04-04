import { supabase } from '@/lib/supabase';

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('회원가입 실패:', error.message);
    return { data: null, error };
  }

  console.log('회원가입 성공:', data);
  return { data, error: null };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('로그인 실패:', error.message);
    return { data: null, error };
  }

  console.log('로그인 성공:', data);
  return { data, error: null };
}

/** 로컬 세션이 없을 때는 getUser() 대신 조용히 null (콘솔의 "Auth session missing!" 방지) */
export async function getCurrentUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('유저 조회 실패:', error.message);
    return session.user;
  }

  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('로그아웃 실패:', error.message);
    return { error };
  }
  return { error: null };
}

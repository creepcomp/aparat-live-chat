"use server";

import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import crypto from 'crypto';

import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const COOKIE_NAME = 'token';

export async function getAparatChannelInfo(channel) {
  const response = await fetch(`https://www.aparat.com/api/fa/v2/Live/LiveStream/show/username/${channel}`);
  if (!response.ok) throw new Error(`Failed to fetch channel info: ${response.statusText}`);
  const data = await response.json();
  return data;
}

function hashPassword(password) {
  const md5 = crypto.createHash('md5').update(password).digest('hex');
  const sha1 = crypto.createHash('sha1').update(md5).digest('hex');
  return sha1;
}

export async function loginAparatWithPassword(username, password) {
  if (!username || !password) {
    return { error: 'نام کاربری و رمز عبور الزامی است.' };
  }

  try {
    const hashedPassword = hashPassword(password);

    const response = await fetch(
      `https://www.aparat.com/etc/api/login/luser/${username}/lpass/${hashedPassword}`,
      {
        cache: 'no-cache',
        headers: { Accept: 'application/json' },
      }
    );

    const data = await response.json();

    if (data?.login?.type === 'error') {
      return { error: data.login.value };
    }

    const profile = data.login;

    const token = await new SignJWT({
      id: profile.id,
      username: profile.username,
      name: profile.name,
      image: profile.pic_s
    })
      .setProtectedHeader({ alg: "HS256" })
      .sign(JWT_SECRET);

    const _cookies = await cookies();
    _cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return {
      success: true,
      message: 'ورود با موفقیت انجام شد.',
      profile: data.profile,
    };

  } catch (error) {
    console.error('Login Error:', error);
    return { error: 'خطا در ارتباط با سرور آپارات.' };
  }
}

export async function logout() {
  const _cookies = await cookies();
  _cookies.delete("nickname");
  _cookies.delete(COOKIE_NAME);
  return { success: true, message: 'خروج با موفقیت انجام شد.' };
}

export async function getCurrentUser() {
  const _cookies = await cookies();

  const token = _cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return false;
  }
}

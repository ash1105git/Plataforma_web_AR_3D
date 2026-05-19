// ═══════════════════════════════════════════════════════════════
//  auth.js — Módulo de autenticación (frontend / sin backend)
//
//  IMPORTANTE:  Esta implementación usa localStorage como capa
//  de persistencia de sesión y credenciales hasheadas en base64
//  solo para la demo.  Cuando tengas backend, reemplaza
//  Auth.login() por una llamada a tu API y elimina USUARIOS.
// ═══════════════════════════════════════════════════════════════

const Auth = (() => {
  'use strict';

  /* ─── Credenciales permitidas (demo sin backend) ────────────────
     En producción: elimina esto y valida contra tu API.
     Formato: { usuario, passB64 }
     passB64 = btoa("contraseña")  — solo ofuscación básica.     */
  const USUARIOS = [
    { usuario: 'admin',    passB64: btoa('strawberry2026') },
    { usuario: 'soporte',  passB64: btoa('yarn2026!') },
  ];

  const SESSION_KEY = 'sy_auth_session';  // clave en localStorage
  const SESSION_TTL = 8 * 60 * 60 * 1000; // 8 horas en ms

  // ── Leer sesión ─────────────────────────────────────────────
  function _leerSesion() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (Date.now() > s.expira) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return s;
    } catch { return null; }
  }

  // ── Guardar sesión ──────────────────────────────────────────
  function _guardarSesion(usuario) {
    const sesion = {
      usuario,
      inicio:  Date.now(),
      expira:  Date.now() + SESSION_TTL,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
    return sesion;
  }

  // ── API pública ─────────────────────────────────────────────

  /**
   * Intenta iniciar sesión.
   * @returns {{ ok: boolean, error?: string }}
   */
  function login(usuario, pass) {
    const user = USUARIOS.find(
      u => u.usuario === usuario.trim() && u.passB64 === btoa(pass)
    );
    if (!user) {
      return { ok: false, error: 'Usuario o contraseña incorrectos.' };
    }
    _guardarSesion(user.usuario);
    return { ok: true };
  }

  /** Cierra la sesión activa. */
  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  /** ¿Hay una sesión activa y vigente? */
  function estaAutenticado() {
    return _leerSesion() !== null;
  }

  /** Devuelve datos de la sesión o null. */
  function getSesion() {
    return _leerSesion();
  }

  /**
   * Llama esto al inicio de CADA página protegida.
   * Si no hay sesión redirige a login.html.
   */
  function protegerPagina() {
    if (!estaAutenticado()) {
      location.replace('login.html');
      return false;
    }
    return true;
  }

  // ── Conectar botón de login si estamos en login.html ───────
  window.addEventListener('DOMContentLoaded', () => {
    const btn      = document.getElementById('btn-login');
    const errorDiv = document.getElementById('error-msg');
    const errorTxt = document.getElementById('error-txt');

    if (!btn) return; // no es la página de login

    btn.addEventListener('click', () => {
      const usuario = (document.getElementById('inp-user')?.value || '').trim();
      const pass    = document.getElementById('inp-pass')?.value || '';

      // Ocultar error previo
      errorDiv?.classList.remove('visible');

      if (!usuario || !pass) {
        if (errorTxt) errorTxt.textContent = 'Completa usuario y contraseña.';
        errorDiv?.classList.add('visible');
        return;
      }

      // Estado cargando
      btn.classList.add('loading');
      btn.disabled = true;

      // Simulamos latencia (quita el setTimeout cuando tengas backend real)
      setTimeout(() => {
        const resultado = login(usuario, pass);
        btn.classList.remove('loading');
        btn.disabled = false;

        if (resultado.ok) {
          location.replace('admin.html');
        } else {
          if (errorTxt) errorTxt.textContent = resultado.error;
          errorDiv?.classList.add('visible');
          document.getElementById('inp-pass').value = '';
          document.getElementById('inp-pass').focus();
        }
      }, 700);
    });
  });

  return { login, logout, estaAutenticado, getSesion, protegerPagina };
})();

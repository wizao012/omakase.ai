/* ==========================================================================
   omakase.ai LP - script.js (v3: SP対応・ドロワー・Swiper)
   ========================================================================== */

/* ---------- 設定 ---------- */
const CONFIG = {
  ZAPIER_WEBHOOK_URL: 'https://hooks.zapier.com/hooks/catch/12525485/4o9e6e9/',
  THANKS_PAGE: 'thanks.html',
  // GTM/広告計測用パラメータキー
  PARAM_KEYS: [
    // UTM標準パラメータ（GA4自動連携）
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    // 配信面・追加情報
    'placement', 'keyword', 'matchtype',
    // クリックID（オフラインCVインポート用）
    'gclid', 'fbclid',
    // 独自パラメータ（手動メモ・既存互換）
    'lpv', 'src', 'camp', 'ag', 'ad', 'pl', 'kw', 'mt'
  ]
};

/* ---------- GTM dataLayer 初期化 ---------- */
window.dataLayer = window.dataLayer || [];

/* ---------- URLパラメータをhidden inputへ ---------- */
(function captureUrlParams() {
  try {
    const params = new URLSearchParams(location.search);
    CONFIG.PARAM_KEYS.forEach(function(key) {
      const el = document.getElementById('trk-' + key);
      if (el) el.value = params.get(key) || '';
    });

    // LPパスを自動取得（サブディレクトリ判定用）
    const lpPathEl = document.getElementById('trk-lp_path');
    if (lpPathEl) lpPathEl.value = location.pathname || '';

    // リファラ取得
    const referrerEl = document.getElementById('trk-referrer');
    if (referrerEl) referrerEl.value = document.referrer || '';
  } catch (e) {}
})();

document.addEventListener('DOMContentLoaded', function() {

  // -----------------------------
  // スムーススクロール
  // -----------------------------
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#' || href === '') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        // ドロワーが開いてたら閉じる
        const drawer = document.getElementById('drawer');
        if (drawer && drawer.classList.contains('is-open')) {
          closeDrawer();
        }
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // -----------------------------
  // ドロワーメニュー
  // -----------------------------
  const menuBtn = document.getElementById('menu-btn');
  const drawer = document.getElementById('drawer');
  const drawerCloseTargets = drawer ? drawer.querySelectorAll('[data-drawer-close]') : [];

  function openDrawer() {
    if (drawer) {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      menuBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    if (drawer) {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function() {
      if (drawer.classList.contains('is-open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });
  }

  drawerCloseTargets.forEach(el => el.addEventListener('click', closeDrawer));

  // -----------------------------
  // 導入事例 Swiper（SPのみ動作）
  // -----------------------------
  let casesSwiper = null;

  function initCasesSwiper() {
    if (window.innerWidth <= 767) {
      if (!casesSwiper) {
        casesSwiper = new Swiper('.cases__swiper', {
          slidesPerView: 1,
          spaceBetween: 16,
          centeredSlides: false,
          loop: false,
          pagination: {
            el: '.cases__pagination',
            clickable: true,
          },
        });
      }
    } else {
      if (casesSwiper) {
        casesSwiper.destroy(true, true);
        casesSwiper = null;
      }
    }
  }

  // 初期化
  if (typeof Swiper !== 'undefined') {
    initCasesSwiper();
    window.addEventListener('resize', initCasesSwiper);
  }

  // -----------------------------
  // スクロール時のフェードイン
  // -----------------------------
  const fadeTargets = document.querySelectorAll(
    '.issue-card, .reason-card, .feature-card, .case-card, .flow-step, .about-feature, .faq-item, .stats__item'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  fadeTargets.forEach(el => {
    el.classList.add('fade-target');
    observer.observe(el);
  });

  // -----------------------------
  // FAQアコーディオン：1つだけ開く
  // -----------------------------
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    item.addEventListener('toggle', function() {
      if (this.open) {
        faqItems.forEach(other => {
          if (other !== this && other.open) {
            other.open = false;
          }
        });
      }
    });
  });

  // -----------------------------
  // 利用規約モーダル
  // -----------------------------
  const termsModal = document.getElementById('terms-modal');
  const termsLink = document.getElementById('terms-link');
  const termsIcon = document.getElementById('terms-icon');
  const modalCloseTargets = termsModal ? termsModal.querySelectorAll('[data-close]') : [];

  function openTermsModal(e) {
    if (e) e.preventDefault();
    if (termsModal) {
      termsModal.classList.add('is-open');
      termsModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeTermsModal() {
    if (termsModal) {
      termsModal.classList.remove('is-open');
      termsModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  if (termsLink) termsLink.addEventListener('click', openTermsModal);
  if (termsIcon) termsIcon.addEventListener('click', openTermsModal);
  modalCloseTargets.forEach(el => el.addEventListener('click', closeTermsModal));

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (termsModal && termsModal.classList.contains('is-open')) {
        closeTermsModal();
      }
      if (drawer && drawer.classList.contains('is-open')) {
        closeDrawer();
      }
    }
  });

  // -----------------------------
  // フォーム送信（Zapier Webhook）
  // -----------------------------
  const form = document.getElementById('contact-form');
  if (form) {
    const submitBtn = document.getElementById('submit-btn');
    const agreeCheckbox = document.getElementById('agree');

    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;
      let firstInvalid = null;

      requiredFields.forEach(field => {
        if (field.type === 'checkbox') {
          if (!field.checked) isValid = false;
          return;
        }
        field.classList.remove('is-error');
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('is-error');
          if (!firstInvalid) firstInvalid = field;
        }
      });

      const email = document.getElementById('email');
      if (email && email.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
          isValid = false;
          email.classList.add('is-error');
          if (!firstInvalid) firstInvalid = email;
        }
      }

      if (!agreeCheckbox.checked) {
        alert('プライバシーポリシー・利用規約に同意の上、「内容に同意する」にチェックを入れてください。');
        return;
      }

      if (!isValid) {
        alert('必須項目を正しく入力してください。');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      submitBtn.disabled = true;
      const originalText = submitBtn.querySelector('.btn__text').textContent;
      submitBtn.querySelector('.btn__text').textContent = '送信中...';

      // フォームの全項目（hidden含む）をFormDataで取得
      // ※name属性のあるinput/textarea/selectが全て自動で入る
      const formData = new FormData(form);
      // 補足情報を追加
      formData.append('submitted_at', new Date().toISOString());
      formData.append('source_url', window.location.href);

      try {
        // no-corsモードでCORSプリフライト回避
        // FormDataなのでContent-Typeは自動でmultipart/form-data（simple request扱い）
        // ※レスポンスは opaque になるが、Zapierには正常に届く
        await fetch(CONFIG.ZAPIER_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: formData
        });
        // GTM dataLayerへCVイベント送信
        window.dataLayer.push({ event: 'form_submit_cv' });
        window.location.href = CONFIG.THANKS_PAGE;
      } catch (err) {
        // 真のネットワークエラー時のみ
        console.error('Form submit error:', err);
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn__text').textContent = originalText;
        alert('送信に失敗しました。お手数ですが時間をおいて再度お試しください。');
      }
    });
  }

});

// フェードイン用スタイル
const fadeStyle = document.createElement('style');
fadeStyle.textContent = `
  .fade-target {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.7s ease, transform 0.7s ease;
  }
  .fade-target.is-visible {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(fadeStyle);

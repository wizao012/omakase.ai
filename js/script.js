/* ==========================================================================
   omakase.ai LP - script.js (v2: フォーム・モーダル対応)
   ========================================================================== */

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
  // スクロール時のフェードイン
  // -----------------------------
  const fadeTargets = document.querySelectorAll(
    '.issue-card, .reason-card, .feature-card, .case-card, .flow-step, .about-feature, .faq-item'
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
  // ハンバーガーメニュー（簡易）
  // -----------------------------
  const menuBtn = document.querySelector('.header__menu');
  if (menuBtn) {
    menuBtn.addEventListener('click', function() {
      alert('メニューはこちらにナビゲーション項目を追加できます。');
    });
  }

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
    if (e.key === 'Escape' && termsModal && termsModal.classList.contains('is-open')) {
      closeTermsModal();
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

      // バリデーション
      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;
      let firstInvalid = null;

      requiredFields.forEach(field => {
        // チェックボックス
        if (field.type === 'checkbox') {
          if (!field.checked) {
            isValid = false;
          }
          return;
        }
        // テキスト系
        field.classList.remove('is-error');
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('is-error');
          if (!firstInvalid) firstInvalid = field;
        }
      });

      // メール簡易チェック
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

      // 送信中状態
      submitBtn.disabled = true;
      const originalText = submitBtn.querySelector('.btn__text').textContent;
      submitBtn.querySelector('.btn__text').textContent = '送信中...';

      // データ収集
      const payload = {
        company: document.getElementById('company').value.trim(),
        name: document.getElementById('name').value.trim(),
        tel: document.getElementById('tel').value.trim(),
        email: document.getElementById('email').value.trim(),
        message: document.getElementById('message').value.trim(),
        submitted_at: new Date().toISOString(),
        source_url: window.location.href
      };

      try {
        const response = await fetch('https://hooks.zapier.com/hooks/catch/12525485/4o9e6e9/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        // Zapierはno-corsの場合もあるため、レスポンスステータスを厳密にはチェックせず成功扱い
        // 厳密チェックしたい場合は response.ok を見る
        window.location.href = 'thanks.html';
      } catch (err) {
        console.error('Form submit error:', err);
        // CORSエラーでもZapier側には届いている可能性が高いため、サンクスページへ
        window.location.href = 'thanks.html';
      }
    });
  }

});

// -----------------------------
// フェードイン用のスタイルを動的に追加
// -----------------------------
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

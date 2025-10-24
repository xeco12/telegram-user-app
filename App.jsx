import React, { useEffect, useState } from 'react';

/**
 * Telegram User Info Mini App
 * - When opened inside Telegram WebApp, reads Telegram.WebApp.initDataUnsafe.user
 * - Shows user's first/last name, username, id and photo (if available)
 * - When opened in a normal browser, shows a mock user and a note
 */

const MOCK_USER = {
  id: 123456789,
  is_bot: false,
  first_name: 'Ahmet',
  last_name: 'Yılmaz',
  username: 'ahmetyilmaz',
  language_code: 'tr'
};

export default function App() {
  const [user, setUser] = useState(null);
  const [fromTelegram, setFromTelegram] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Try to access Telegram WebApp object
    try {
      const TWA = window.Telegram?.WebApp;
      if (TWA) {
        // mark as inside Telegram
        setFromTelegram(true);

        // Notify Telegram that app is ready
        if (typeof TWA.ready === 'function') TWA.ready();

        // Get initDataUnsafe user (may be undefined if not provided)
        const initUser = TWA.initDataUnsafe?.user;
        if (initUser) {
          setUser(initUser);
        } else {
          // Fallback: try to read 'user' from initData (signed) - not parsed here
          setUser(MOCK_USER);
        }
      } else {
        // Not inside Telegram, use mock user for testing
        setUser(MOCK_USER);
      }
    } catch (err) {
      console.error('Telegram WebApp error', err);
      setUser(MOCK_USER);
    } finally {
      setReady(true);
    }
  }, []);

  if (!ready) {
    return (
      <div className="container">
        <div className="card">
          <p className="small">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <img
          src={ user && user.photo_url ? user.photo_url : `https://avatars.dicebear.com/api/identicon/${user?.id || 'guest'}.svg` }
          alt="Avatar"
          width="96"
          height="96"
          style={{ borderRadius: 12, border: '2px solid rgba(255,255,255,0.06)' }}
        />
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0 }}>{user?.first_name || ''} {user?.last_name || ''}</h2>
          <p className="small" style={{ margin: '6px 0' }}>
            {user?.username ? `@${user.username}` : <em>Kullanıcı adı yok</em>}
          </p>
          <p className="small">ID: {user?.id}</p>
          <p className="small">Dil: {user?.language_code || 'bilinmiyor'}</p>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              className="btn"
              onClick={() => {
                // If inside Telegram, open user's profile in Telegram
                if (fromTelegram && window.Telegram?.WebApp) {
                  // openTelegramLink accepts tg:// or https links; open profile by t.me/username if exists
                  const username = user?.username;
                  if (username) {
                    window.Telegram.WebApp.openTelegramLink(`https://t.me/${username}`);
                  } else {
                    alert('Bu kullanıcının kullanıcı adı yok.');
                  }
                } else {
                  // open new tab to t.me if username exists
                  const username = user?.username;
                  if (username) {
                    window.open(`https://t.me/${username}`, '_blank');
                  } else {
                    alert('Kullanıcı adı yok.');
                  }
                }
              }}
            >
              Profili Aç
            </button>

            <button
              className="btn"
              onClick={() => {
                // Send user's id to Telegram's main button (example)
                if (window.Telegram?.WebApp) {
                  try {
                    window.Telegram.WebApp.MainButton.setText('Kullanıcı ID Gönder');
                    window.Telegram.WebApp.MainButton.show();
                    window.Telegram.WebApp.MainButton.onClick(() => {
                      // send data back via Telegram bot (this requires backend)
                      alert('MainButton tıklandı. Sunucuya gönderme eklemeniz gerekir.');
                    });
                  } catch (e) {
                    console.error(e);
                    alert('Telegram MainButton kullanılamadı.');
                  }
                } else {
                  alert('Sadece Telegram içinde kullanılabilir.');
                }
              }}
            >
              ID Gönder (Örnek)
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Bilgi</h3>
        <p className="small">
          {fromTelegram
            ? 'Uygulama Telegram içinde açıldı — bilgiler Telegram tarafından sağlandı.'
            : 'Tarayıcıda açıldı — bu yüzden örnek (mock) kullanıcı gösteriliyor. Gerçek kullanım için Telegram içinden açın.'}
        </p>
      </div>
    </div>
  );
}
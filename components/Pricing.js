const buttonState = new Map();

export async function handlePurchase(tier, button) {
  if (!tier || !button) {
    return;
  }

  if (buttonState.get(button)) {
    return;
  }

  const originalText = button.textContent;
  buttonState.set(button, true);
  button.disabled = true;
  button.textContent = "Processing...";

  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tier }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error || 'Unable to start checkout.');
    }

    if (!payload?.url) {
      throw new Error('Checkout URL was not returned by the server.');
    }

    window.location.assign(payload.url);
  } catch (error) {
    console.error(error);
    alert(error.message || 'Checkout failed. Please try again.');
    button.disabled = false;
    button.textContent = originalText;
    buttonState.set(button, false);
  }
}

function bindPricingButtons() {
  const buttons = document.querySelectorAll('[data-tier]');

  buttons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      handlePurchase(button.dataset.tier, button);
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindPricingButtons);
} else {
  bindPricingButtons();
}

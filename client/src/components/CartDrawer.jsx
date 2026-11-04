import React from "react";
import "./CartDrawer.css";

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onProceedToCheckout,
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div
        className="cart-drawer-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cart-drawer-header">
          <h2>
            Your Spiritual Cart ({cartItems.reduce((a, c) => a + c.quantity, 0)}
            )
          </h2>
          <button className="cart-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body Content */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="empty-cart-state">
              <span className="empty-cart-icon">🛒</span>
              <p>Your cart is currently empty.</p>
              <button className="btn-primary-checkout" onClick={onClose}>
                Explore Store Remedies
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item-card">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-img"
                  />
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <span className="cart-item-category">{item.category}</span>
                    <span className="cart-item-price">
                      ₹ {Number(item.price).toLocaleString()}
                    </span>
                  </div>
                  <div className="cart-item-controls">
                    <button onClick={() => onUpdateQuantity(item.id, -1)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.id, 1)}>
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Summary & Checkout CTA */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total-row">
              <span>Subtotal</span>
              <span className="total-amount">
                ₹ {subtotal.toLocaleString()}
              </span>
            </div>
            <p className="shipping-note">
              Taxes &amp; secure energized delivery calculated at checkout.
            </p>
            <button
              className="btn-primary-checkout"
              onClick={onProceedToCheckout}
            >
              Proceed to Full Checkout &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

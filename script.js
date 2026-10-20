let cart = [];
const deliveryFee = 8000;
const whatsappPhone = "243986133422";

// Ajouter un article standard au panier
function addToCart(itemName, itemPrice) {
    const existingItem = cart.find(item => item.name === itemName);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: itemName,
            price: itemPrice,
            quantity: 1
        });
    }

    updateCartUI();
}

// Ajouter la portion de frites selon la taille choisie
function addSelectedFries() {
    const selectElement = document.getElementById('fries-size');
    if (!selectElement) return;

    const [friesName, priceStr] = selectElement.value.split('|');
    const friesPrice = parseInt(priceStr, 10);

    addToCart(friesName, friesPrice);
}

// Ajouter une boisson individuelle au panier
function addSelectedDrink() {
    const selectElement = document.getElementById('drink-choice');
    if (!selectElement) return;

    const drinkName = `Boisson (${selectElement.value})`;
    addToCart(drinkName, 2000);
}

// Ajouter un combo avec la boisson choisie
function addComboWithDrink(comboName, comboPrice, selectId) {
    const selectElement = document.getElementById(selectId);
    const drinkChoice = selectElement ? selectElement.value : 'Au choix';
    const fullName = `${comboName} [Boisson : ${drinkChoice}]`;

    addToCart(fullName, comboPrice);
}

// Retirer ou réduire la quantité d'un article
function removeFromCart(itemName) {
    const itemIndex = cart.findIndex(item => item.name === itemName);

    if (itemIndex !== -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1;
        } else {
            cart.splice(itemIndex, 1);
        }
    }

    updateCartUI();
}

// Vider complètement le panier
function clearCart() {
    cart = [];
    updateCartUI();
}

// Escaper les caractères HTML pour sécuriser l'affichage
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Valider les champs du formulaire
function validateOrderForm() {
    const customerName = document.getElementById('customer-name')?.value.trim();
    const customerAddress = document.getElementById('customer-address')?.value.trim();
    const customerPhone = document.getElementById('customer-phone')?.value.trim();

    if (!customerName || !customerAddress) {
        alert("Veuillez saisir votre nom et votre adresse de livraison complète.");
        return false;
    }

    if (!customerPhone) {
        alert("Veuillez saisir votre numéro de téléphone.");
        return false;
    }

    // Validation simple du numéro
    if (!/^\d{8,15}$/.test(customerPhone.replace(/\s+/g, ''))) {
        alert("Veuillez saisir un numéro de téléphone valide.");
        return false;
    }

    return true;
}

// Mettre à jour l'affichage du panier
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const subtotalElement = document.getElementById('cart-subtotal');
    const deliveryElement = document.getElementById('cart-delivery');
    const totalElement = document.getElementById('cart-total');
    const cartBadge = document.getElementById('cart-count');
    const cartActions = document.getElementById('cart-actions');

    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';

    let subtotal = 0;
    let totalItems = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Votre panier est actuellement vide.</p>';
        if (cartActions) cartActions.style.display = 'none';
    } else {
        if (cartActions) cartActions.style.display = 'flex';

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            totalItems += item.quantity;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';

            itemElement.innerHTML = `
                <div class="cart-item-details">
                    <span class="cart-item-title">${escapeHtml(item.name)}</span>
                    <span class="cart-item-price">${item.price.toLocaleString('fr-FR')} FC x ${item.quantity}</span>
                </div>
                <div class="cart-item-actions">
                    <button type="button" class="qty-btn" data-action="remove" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button type="button" class="qty-btn" data-action="add" data-index="${index}">+</button>
                </div>
            `;

            cartItemsContainer.appendChild(itemElement);
        });
    }

    const total = subtotal > 0 ? subtotal + deliveryFee : 0;

    if (subtotalElement) subtotalElement.textContent = `${subtotal.toLocaleString('fr-FR')} FC`;
    if (deliveryElement) deliveryElement.textContent = subtotal > 0 ? `${deliveryFee.toLocaleString('fr-FR')} FC` : '0 FC';
    if (totalElement) totalElement.textContent = `${total.toLocaleString('fr-FR')} FC`;
    if (cartBadge) cartBadge.textContent = totalItems;
}

// Gérer les boutons +/- du panier
document.addEventListener('click', function (event) {
    const button = event.target.closest('.qty-btn');
    if (!button) return;

    const action = button.dataset.action;
    const index = Number(button.dataset.index);

    if (!Number.isInteger(index) || index < 0 || index >= cart.length) return;

    if (action === 'remove') {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
    }

    if (action === 'add') {
        cart[index].quantity += 1;
    }

    updateCartUI();
});

// Envoyer la commande directement vers WhatsApp
function sendWhatsAppOrder() {
    if (cart.length === 0) {
        alert("Votre panier est vide. Veuillez ajouter des articles avant de passer commande !");
        return;
    }

    if (!validateOrderForm()) {
        return;
    }

    const customerName = document.getElementById('customer-name')?.value.trim();
    const customerAddress = document.getElementById('customer-address')?.value.trim();
    const customerPhone = document.getElementById('customer-phone')?.value.trim();

    let subtotal = 0;
    let message = `🍔 *NOUVELLE COMMANDE STREET BURGER* 🍔\n\n`;
    message += `👤 *Nom :* ${customerName}\n`;
    message += `📞 *Téléphone :* ${customerPhone}\n`;
    message += `📍 *Adresse de livraison :* ${customerAddress}\n\n`;
    message += `📋 *Détail de la commande :*\n`;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        message += `• ${item.name} (x${item.quantity}) : ${itemTotal.toLocaleString('fr-FR')} FC\n`;
    });

    const total = subtotal + deliveryFee;

    message += `\n💵 *Sous-total :* ${subtotal.toLocaleString('fr-FR')} FC`;
    message += `\n🛵 *Livraison :* ${deliveryFee.toLocaleString('fr-FR')} FC`;
    message += `\n💰 *TOTAL À PAYER :* ${total.toLocaleString('fr-FR')} FC\n\n`;
    message += `Merci de confirmer la prise en charge de ma commande !`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;

    window.open(whatsappURL, '_blank');
}
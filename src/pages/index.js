import "./index.css";
import {
  enableValidation,
  validationConfig,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";

const initialCards = [
  {
    name: "Golden Gate bridge",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/7-photo-by-griffin-wooldridge-from-pexels.jpg",
  },
  {
    name: "Val Thorens",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
  },
  {
    name: "Restaurant terrace",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
  },
  {
    name: "An outdoor cafe",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
  },
  {
    name: "A very long bridge, over the forest and through the trees",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
  },
  {
    name: "Tunnel with morning light",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
  },
  {
    name: "Mountain house",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
  },
];

const profileEditButton      = document.querySelector(".profile__edit-btn");
const profileName            = document.querySelector(".profile__name");
const profileDescription     = document.querySelector(".profile__description");
const profileAvatar          = document.querySelector(".profile__avatar");

// Avatar
const avatarButton           = document.querySelector(".profile__avatar-btn");
const avatarModal            = document.querySelector("#avatar-modal");
const avatarForm             = avatarModal.querySelector(".modal__form");
const avatarInput            = avatarForm.querySelector(".modal__input_type_avatar-link");
const avatarSaveBtn          = avatarForm.querySelector(".modal__save-btn");
const avatarCloseBtn         = avatarModal.querySelector(".modal__close_type_avatar");

// Cards list & template
const cardsList              = document.querySelector(".cards__list");
const cardTemplate           = document.querySelector("#card-template");

// Edit Profile modal
const editModal              = document.querySelector("#edit-modal");
const editForm               = editModal.querySelector(".modal__form");
const editModalNameInput     = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput =
  editModal.querySelector("#profile-description-input");
const editModalCloseBtn      = editModal.querySelector(".modal__close-btn");

// Add Card modal
const cardModalBtn           = document.querySelector(".profile__add-btn");
const addCardModal           = document.querySelector("#add-card-modal");
const addCardForm            = addCardModal.querySelector(".modal__form");
const addCardNameInput       = addCardModal.querySelector("#add-card-name-input");
const addCardLinkInput       = addCardModal.querySelector("#add-card-link-input");
const addCardSubmitBtn       = addCardModal.querySelector(".modal__submit-btn");
const addCardCloseBtn        = addCardModal.querySelector(".modal__close-btn");

// Preview Image modal
const previewModal           = document.querySelector("#preview-modal");
const previewImage           = previewModal.querySelector(".modal__preview-image");
const previewCaption         = previewModal.querySelector(".modal__caption");
const previewCloseBtn        = previewModal.querySelector(".modal__close-btn");

// Delete Confirmation modal
const deleteModal            = document.querySelector("#delete-modal");
const deleteForm             = deleteModal.querySelector("#delete__form");
const deleteCloseBtn         = deleteModal.querySelector(".modal__close-btn");
const deleteCancelBtn        = deleteModal.querySelector(".modal__button_type_cancel");

// ── 2. STATE & API CLIENT ────────────────────────────────────
let currentUserId = null;
let cardToDelete  = null;

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "0d994c7b-6944-4553-ad8f-1b14fe67b143",
    "Content-Type": "application/json",
  },
});

// ── 3. HELPER FUNCTIONS ──────────────────────────────────────
function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscClose);
}
function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscClose);
}
function closeDeleteModal() {
  closeModal(deleteModal);
  cardToDelete = null;
}
function handleEscClose(evt) {
  if (evt.key === "Escape") {
    const openEl = document.querySelector(".modal_opened");
    if (openEl) closeModal(openEl);
  }
}

// ── 4. INITIALIZE: FETCH USER INFO & CARDS ────────────────────
api.getAppInfo()
  .then(([userData, cards]) => {
    // Populate profile
    currentUserId            = userData._id;
    profileName.textContent        = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.src              = userData.avatar;

    // Render cards from server
    cards.forEach(data => cardsList.prepend(getCardElement(data)));
  })
  .catch(err => {
    console.error("API error, falling back to static cards:", err);
    // if API fails, show your initialCards
    initialCards.forEach(data => cardsList.prepend(getCardElement(data)));
  });

// ── 5. CARD FACTORY ──────────────────────────────────────────
function getCardElement(data) {
  const cardEl      = cardTemplate.content.cloneNode(true).querySelector(".card");
  const deleteBtn   = cardEl.querySelector(".card__delete-button");
  const likeBtn     = cardEl.querySelector(".card__like-button");
  const likeCountEl = cardEl.querySelector(".card__like-count");
  const imgEl       = cardEl.querySelector(".card__image");
  const titleEl     = cardEl.querySelector(".card__title");

  titleEl.textContent     = data.name;
  imgEl.src               = data.link;
  imgEl.alt               = data.name;
  likeCountEl.textContent = Array.isArray(data.likes) ? data.likes.length : 0;
  if (Array.isArray(data.likes) && data.likes.some(u => u._id === currentUserId)) {
    likeBtn.classList.add("card__like-button_liked");
  }

  imgEl.addEventListener("click", () => {
    previewImage.src           = data.link;
    previewCaption.textContent = data.name;
    openModal(previewModal);
  });

  likeBtn.addEventListener("click", () => {
    const isLiked = likeBtn.classList.contains("card__like-button_liked");
    const call    = isLiked ? api.unlikeCard(data._id) : api.likeCard(data._id);
    likeBtn.disabled = true;
    call
      .then(updated => {
        likeBtn.classList.toggle("card__like-button_liked");
        likeCountEl.textContent = updated.likes.length;
      })
      .catch(err => console.error("Like error:", err))
      .finally(() => (likeBtn.disabled = false));
  });

  deleteBtn.addEventListener("click", () => {
    cardToDelete = cardEl;
    openModal(deleteModal);
  });

  return cardEl;
}

// ── 6. DELETE CONFIRMATION ───────────────────────────────────
deleteForm.addEventListener("submit", evt => {
  evt.preventDefault();
  api.removeCard(cardToDelete.dataset.id)
    .then(() => {
      cardToDelete.remove();
      closeDeleteModal();
    })
    .catch(err => console.error("Delete error:", err));
});

deleteCloseBtn.addEventListener("click", closeDeleteModal);
deleteCancelBtn.addEventListener("click", closeDeleteModal);

// ── 7. EDIT PROFILE ─────────────────────────────────────────
profileEditButton.addEventListener("click", () => {
  editModalNameInput.value        = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(editForm, validationConfig);
  openModal(editModal);
});
editModalCloseBtn.addEventListener("click", () => closeModal(editModal));

editForm.addEventListener("submit", evt => {
  evt.preventDefault();
  const saveBtn = editForm.querySelector(".modal__submit-btn");
  saveBtn.textContent = "Saving...";
  api.editUserInfo({
    name: editModalNameInput.value,
    about: editModalDescriptionInput.value,
  })
    .then(data => {
      profileName.textContent        = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
    })
    .catch(err => console.error("Profile edit error:", err))
    .finally(() => (saveBtn.textContent = "Save"));
});

// ── 8. ADD CARD ─────────────────────────────────────────────
cardModalBtn.addEventListener("click", () => {
  resetValidation(addCardForm, validationConfig);
  openModal(addCardModal);
});
addCardCloseBtn.addEventListener("click", () => closeModal(addCardModal));

addCardForm.addEventListener("submit", evt => {
  evt.preventDefault();
  const createBtn = addCardForm.querySelector(".modal__submit-btn");
  createBtn.textContent = "Saving...";
  api.addCard({
    name: addCardNameInput.value,
    link: addCardLinkInput.value,
  })
    .then(newCardData => {
      cardsList.prepend(getCardElement(newCardData));
      closeModal(addCardModal);
      addCardForm.reset();
      disableButton(addCardSubmitBtn, validationConfig);
    })
    .catch(err => console.error("Add card error:", err))
    .finally(() => (createBtn.textContent = "Create"));
});

// ── 9. CHANGE AVATAR ───────────────────────────────────────
avatarButton.addEventListener("click", () => {
  resetValidation(avatarForm, validationConfig);
  openModal(avatarModal);
});
avatarCloseBtn.addEventListener("click", () => closeModal(avatarModal));

avatarForm.addEventListener("submit", evt => {
  evt.preventDefault();
  const saveBtn = avatarForm.querySelector(".modal__save-btn");
  saveBtn.textContent = "Saving...";
  api.updateAvatar({ avatar: avatarInput.value })
    .then(data => {
      profileAvatar.src = data.avatar;
      closeModal(avatarModal);
      avatarForm.reset();
    })
    .catch(err => console.error("Avatar update error:", err))
    .finally(() => (saveBtn.textContent = "Save"));
});

// ── 10. OVERLAY & ESCAPE HANDLERS + ENABLE VALIDATION ─────
[
  editModal,
  addCardModal,
  previewModal,
  avatarModal,
  deleteModal,
].forEach(modalEl =>
  modalEl.addEventListener("mousedown", evt => {
    if (evt.target === modalEl) closeModal(modalEl);
  })
);

document.addEventListener("keydown", handleEscClose);

enableValidation(validationConfig);
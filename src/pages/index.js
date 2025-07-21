import "./index.css";
import {
  enableValidation,
  validationConfig,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";
import logo from "../images/logo.svg";
import icon from "../images/icon.svg";
import plus from "../images/plus.svg";
import pencil from "../images/pencillight.svg";
import avatarImage from "../images/avatar.jpg";
import close from "../images/close.svg";

document.addEventListener("DOMContentLoaded", () => {
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

  const profileEditButton = document.querySelector(".profile__edit-btn");
  const profileName = document.querySelector(".profile__name");
  const profileDescription = document.querySelector(".profile__description");

  const profileAvatar = document.querySelector(".profile__avatar");
  const avatarButton = document.querySelector(".profile__avatar-btn");
  const avatarModal = document.querySelector("#avatar-modal");
  const avatarForm = document.querySelector("#avatar-form");
  const avatarInput = avatarForm.querySelector(
    ".modal__input_type_avatar-link"
  );
  const avatarCloseBtn = avatarModal.querySelector(
    ".modal__close-btn"
  );

  const cardsList = document.querySelector(".cards__list");
  const cardTemplate = document.querySelector("#card-template");

  const editModal = document.querySelector("#edit-modal");
  const editForm = editModal.querySelector(".modal__form");
  const editModalNameInput = editModal.querySelector("#profile-name-input");
  const editModalDescriptionInput = editModal.querySelector(
    "#profile-description-input"
  );
  const editModalCloseBtn = editModal.querySelector(".modal__close-btn");

  const cardModalBtn = document.querySelector(".profile__add-btn");
  const addCardModal = document.querySelector("#add-card-modal");
  const addCardForm = document.querySelector("#add-card-form");

  const addCardNameInput = addCardModal.querySelector("#add-card-name-input");
  const addCardLinkInput = addCardModal.querySelector("#add-card-link-input");
  const addCardSubmitBtn = addCardModal.querySelector(".modal__submit-btn");
  const addCardCloseBtn = addCardModal.querySelector(".modal__close-btn");

  const previewModal = document.querySelector("#preview-modal");
  const previewImage = previewModal.querySelector(".modal__preview-image");
  const previewCaption = previewModal.querySelector(".modal__caption");
  const previewCloseBtn = previewModal.querySelector(".modal__close-btn");

  const deleteModal = document.querySelector("#delete-modal");
  const deleteForm = deleteModal.querySelector("#delete__form");
  const deleteCloseBtn = deleteModal.querySelector(".modal__close-btn");
  const deleteCancelBtn = deleteModal.querySelector(
    ".modal__button_type_cancel"
  );

  const logoEl = document.querySelector(".header__logo");
  if (logoEl) logoEl.src = logo;

  const iconImg = document.querySelector(".profile__edit-btn img");
  if (iconImg) iconImg.src = icon;

  const plusImg = document.querySelector(".profile__add-btn img");
  if (plusImg) plusImg.src = plus;

  const pencilImg = document.querySelector(".profile__avatar-btn img");
  if (pencilImg) pencilImg.src = pencil;

  document.querySelectorAll(".modal__close-btn").forEach((btn) => {
    const img = btn.querySelector("img");
    if (img) img.src = close;
  });

  let currentUserId = null;
  let cardToDelete = null;

  const api = new Api({
    baseUrl: "https://around-api.en.tripleten-services.com/v1",
    headers: {
      authorization: "0d994c7b-6944-4553-ad8f-1b14fe67b143",
      "Content-Type": "application/json",
    },
  });

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

  api
    .getAppInfo()
    .then(([userData, cards]) => {
      currentUserId = userData._id;
      profileName.textContent = userData.name;
      profileDescription.textContent = userData.about;
      profileAvatar.src = userData.avatar;
      cards.forEach((data) => cardsList.prepend(getCardElement(data)));
    })
    .catch((err) => {
      console.error("API error, falling back to static cards:", err);
      initialCards.forEach((data) => cardsList.prepend(getCardElement(data)));
    });

  function getCardElement(data) {
    const cardEl = cardTemplate.content.cloneNode(true).querySelector(".card");
    cardEl.dataset.id = data._id;

    const deleteBtn = cardEl.querySelector(".card__delete-button");
    const likeBtn = cardEl.querySelector(".card__like-button");
    const likeCountEl = cardEl.querySelector(".card__like-count");
    const imgEl = cardEl.querySelector(".card__image");
    const titleEl = cardEl.querySelector(".card__title");

    titleEl.textContent = data.name;
    imgEl.src = data.link;
    imgEl.alt = data.name;

    const likes = Array.isArray(data.likes) ? data.likes : [];
    likeCountEl.textContent = likes.length;

    if (likes.some((user) => user._id === currentUserId)) {
      likeBtn.classList.add("card__like-button_liked");
    }

    imgEl.addEventListener("click", () => {
      previewImage.src = data.link;
      previewImage.alt = data.name;
      previewCaption.textContent = data.name;
      openModal(previewModal);
    });

    likeBtn.addEventListener("click", () => {
      const isLiked = likeBtn.classList.contains("card__like-button_liked");
      likeBtn.disabled = true;
      const action = isLiked
        ? api.dislikeCard(data._id)
        : api.likeCard(data._id);

      action
        .then((updatedCard) => {
          const updatedLikes = Array.isArray(updatedCard.likes)
            ? updatedCard.likes
            : [];
          likeCountEl.textContent = updatedLikes.length;

          if (updatedLikes.some((user) => user._id === currentUserId)) {
            likeBtn.classList.add("card__like-button_liked");
          } else {
            likeBtn.classList.remove("card__like-button_liked");
          }
        })

        .catch((err) => console.error("Like error:", err))
        .finally(() => (likeBtn.disabled = false));
    });

    deleteBtn.addEventListener("click", () => {
      cardToDelete = cardEl;
      openModal(deleteModal);
    });

    return cardEl;
  }

  deleteForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    api
      .removeCard(cardToDelete.dataset.id)
      .then(() => {
        cardToDelete.remove();
        closeDeleteModal();
      })
      .catch((err) => console.error("Delete error:", err));
  });

  deleteCloseBtn.addEventListener("click", closeDeleteModal);
  deleteCancelBtn.addEventListener("click", closeDeleteModal);

  previewCloseBtn.addEventListener("click", () => closeModal(previewModal));

  profileEditButton.addEventListener("click", () => {
    editModalNameInput.value = profileName.textContent;
    editModalDescriptionInput.value = profileDescription.textContent;
    resetValidation(editForm, validationConfig);
    openModal(editModal);
  });

  editModalCloseBtn.addEventListener("click", () => closeModal(editModal));

  editForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    const saveBtn = editForm.querySelector(".modal__submit-btn");
    saveBtn.textContent = "Saving...";
    api
      .editUserInfo({
        name: editModalNameInput.value,
        about: editModalDescriptionInput.value,
      })
      .then((data) => {
        profileName.textContent = data.name;
        profileDescription.textContent = data.about;
        closeModal(editModal);
      })
      .catch((err) => console.error("Profile edit error:", err))
      .finally(() => (saveBtn.textContent = "Save"));
  });

  cardModalBtn.addEventListener("click", () => {
    resetValidation(addCardForm, validationConfig);
    openModal(addCardModal);
  });

  addCardCloseBtn.addEventListener("click", () => closeModal(addCardModal));

  addCardForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    const createBtn = addCardForm.querySelector(".modal__submit-btn");
    createBtn.textContent = "Saving...";

    api
      .addCard({
        name: addCardNameInput.value,
        link: addCardLinkInput.value,
      })
      .then((newCardData) => {
        cardsList.prepend(getCardElement(newCardData));
        closeModal(addCardModal);
        addCardForm.reset();
        disableButton(addCardSubmitBtn, validationConfig);
      })
      .catch((err) => console.error("Add card error:", err))
      .finally(() => (createBtn.textContent = "Create"));
  });

  avatarButton.addEventListener("click", () => {
    resetValidation(avatarForm, validationConfig);
    openModal(avatarModal);
  });

  avatarCloseBtn.addEventListener("click", () => closeModal(avatarModal));

  avatarForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    const saveBtn = avatarForm.querySelector(".modal__submit-btn");
    saveBtn.textContent = "Saving...";
    api
      .updateAvatar({ avatar: avatarInput.value })
      .then((data) => {
        profileAvatar.src = data.avatar;
        closeModal(avatarModal);
        avatarForm.reset();
      })
      .catch((err) => console.error("Avatar update error:", err))
      .finally(() => (saveBtn.textContent = "Save"));
  });

  [editModal, addCardModal, previewModal, avatarModal, deleteModal].forEach(
    (modalEl) => {
      modalEl.addEventListener("mousedown", (evt) => {
        if (evt.target === modalEl) closeModal(modalEl);
      });
    }
  );

  enableValidation(validationConfig);
});

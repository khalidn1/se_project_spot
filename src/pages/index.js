import "./index.css";
import {
  enableValidation,
  validationConfig,
  resetValidation,
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

let selectedCard;
let selectedCardId;


const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "0d994c7b-6944-4553-ad8f-1b14fe67b143",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([userInfo, cards]) => {
    profileName.textContent = userInfo.name;
    profileDescription.textContent = userInfo.about;
    profileAvatar.src = userInfo.avatar;

    cards.forEach((item) => {
      const cardEl = getCardElement(item);
      cardsList.prepend(cardEl);
    });
  })
  .catch(console.error);

  const avatarModal = document.querySelector("#avatar-modal");
  const avatarForm = avatarModal.querySelector("#avatar-form");
  const avatarInput = avatarForm.querySelector(".modal__input_type_avatar-link");
  const avatarSaveButton = avatarForm.querySelector(".modal__save-btn");
  const profileAvatar = document.querySelector(".profile__avatar");
  const avatarButton = document.querySelector(".profile__avatar-btn");


avatarButton.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const saveButton = avatarForm.querySelector(".modal__save-btn");
  saveButton.textContent = "Saving...";

  const avatarLink = avatarInput.value;

  api
    .updateAvatar({ avatar: avatarLink })
    .then((data) => {
      profileAvatar.src = data.avatar;
      closeModal(avatarModal);
      avatarForm.reset();
    })
    .catch(console.error)
    .finally(() => {
      avatarSaveButton.textContent = "Save";
    });
});

const profileEditButton = document.querySelector(".profile__edit-btn");
const cardModalBtn = document.querySelector(".profile__add-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

const editModal = document.querySelector("#edit-modal");
const editFormElement = editModal.querySelector(".modal__form");
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);
const cardModal = document.querySelector("#add-card-modal");
const cardForm = cardModal.querySelector(".modal__form");
const cardSubmitButton = document.querySelector(
  "#add-card-modal .modal__submit-btn"
);
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");

const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

const previewModal = document.querySelector("#preview-modal");
const previewImage = previewModal.querySelector(".modal__preview-image");
const previewCaption = previewModal.querySelector(".modal__caption");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");

function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
const deleteButton = cardElement.querySelector(".card__delete-btn");
cardElement.dataset.id = data._id;

deleteButton.addEventListener("click", () => {
  handleDeleteCard(cardElement, data._id);
});

function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

const cardNameEl = cardElement.querySelector(".card__title");
const cardImageEl = cardElement.querySelector(".card__image");
const likeButton = cardElement.querySelector(".card__like-button");

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  likeCount.textContent = data.likes.length;
  if (data.likes.some((user) => user._id === currentUserId)) {
    likeButton.classList.add("card__like-button_liked");
  }

  likeButton.addEventListener("click", () => {
    const isLiked = likeButton.classList.contains("card__like-button_liked");
  
    const apiCall = isLiked ? api.dislikeCard(data._id) : api.likeCard(data._id);
  
    likeButton.disabled = true;
  
    apiCall
      .then((updatedCard) => {
        likeButton.classList.toggle("card__like-button_liked");
        likeCount.textContent = updatedCard.likes.length;
      })
      .catch((err) => {
        console.error("Error updating like status:", err);
      })
      .finally(() => {
        likeButton.disabled = false;
      });
  });

 deleteButton.addEventListener("click", () => {
  handleDeleteCard(cardElement, data._id);
});

  cardImageEl.addEventListener("click", () => {
    previewImage.src = data.link;
    previewImage.alt = data.name;
    previewCaption.textContent = data.name;
    openModal(previewModal);
  });

  return cardElement;
}

const deleteModal    = document.getElementById("delete-modal");
const closeModalBtn  = deleteModal.querySelector(".modal__close-btn");
const cancelModalBtn = deleteModal.querySelector(".modal__button_type_cancel");
const confirmForm    = deleteModal.querySelector("#delete__form");

let cardToDelete = null;

confirmForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  if (cardToDelete) {
    const cardId = cardToDelete.dataset.id;

    api
      .removeCard(cardId)
      .then(() => {
        cardToDelete.remove();
        closeDeleteModal();
      })
      .catch((err) => {
        console.error("Error deleting card:", err);
      });
  }
});

function openDeleteModal(cardElement) {
  cardToDelete = cardElement;
  deleteModal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscClose);
}

function closeDeleteModal() {
  deleteModal.classList.remove("modal_opened");
  cardToDelete = null;
  document.removeEventListener("keydown", handleEscClose);
}

function handleEscClose(evt) {
  if (evt.key === "Escape") {
    const openMod = document.querySelector(".modal.modal_opened");
    if (openMod) {
      closeDeleteModal();
    }
  }
}

closeModalBtn.addEventListener("click", () => {
  closeDeleteModal();
});

cancelModalBtn.addEventListener("click", () => {
  closeDeleteModal();
});

deleteModal.addEventListener("click", (evt) => {
  if (evt.target === deleteModal) {
    closeDeleteModal();
  }
});

confirmForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  if (cardToDelete) {
    cardToDelete.remove();
    closeDeleteModal();
  }
});

function handleEditFormSubmit(evt) {
  evt.preventDefault();
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
    .catch(console.error)
    .finally(() => {
      saveButton.textContent = "Save";
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  const name = cardNameInput.value;
  const link = cardLinkInput.value;

  const newCard = {
    name: name,
    link: link,
  };

  const cardElement = getCardElement(newCard);
  cardsList.prepend(cardElement);

  cardForm.reset();

  disableButton(cardSubmitButton, validationConfig);

  closeModal(cardModal);
}

profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(editFormElement, validationConfig);
  openModal(editModal);
});

editModalCloseBtn.addEventListener("click", () => {
  closeModal(editModal);
});

cardModalBtn.addEventListener("click", () => {
  openModal(cardModal);
});

cardModalCloseBtn.addEventListener("click", () => {
  closeModal(cardModal);
});

previewModalCloseBtn.addEventListener("click", () => {
  closeModal(previewModal);
});


cardForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const submitButton = cardForm.querySelector(".modal__save-btn");
  submitButton.textContent = "Saving..."; 

  const name = cardNameInput.value;
  const link = cardLinkInput.value;

  api
    .addCard({ name, link })
    .then((card) => {
      const cardElement = getCardElement(card);
      cardsList.prepend(cardElement);
      closeModal(cardModal);
      cardForm.reset();
    })
    .catch((err) => {
      console.error("Error adding card:", err);
      alert("Failed to add card. Please try again."); 
    })
    .finally(() => {
      submitButton.textContent = "Create"; 
    });
});


deleteForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const deleteButton = deleteForm.querySelector(".modal__save-btn");
  deleteButton.textContent = "Deleting..."; 

  api
    .removeCard(selectedCardId)
    .then(() => {
      selectedCard.remove(); 
      closeModal(deleteModal); 
    })
    .catch((err) => {
      console.error("Error deleting card:", err);
      alert("Failed to delete card. Please try again."); 
    })
    .finally(() => {
      deleteButton.textContent = "Yes"; 
    });
});

editFormElement.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const saveButton = editFormElement.querySelector(".modal__save-btn");
  saveButton.textContent = "Saving...";

  const name = editModalNameInput.value;
  const about = editModalDescriptionInput.value;

  api
    .editUserInfo({ name, about })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editModal);
    })
    .catch((err) => {
      console.error("Error updating profile:", err);
      alert("Failed to update profile. Please try again.");
    })
    .finally(() => {
      saveButton.textContent = "Save";
    });
});

const modals = document.querySelectorAll(".modal");

modals.forEach((modal) => {
  modal.addEventListener("mousedown", (evt) => {
    if (evt.target === modal) {
      closeModal(modal);
    }
  });
});

enableValidation(validationConfig);

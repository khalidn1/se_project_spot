function enableValidation(config) {
    const formList = Array.from(document.querySelectorAll(config.formSelector));
  
    formList.forEach((formElement) => {
      formElement.addEventListener("submit", (evt) => {
        evt.preventDefault();
      });
  
      const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
      const buttonElement = formElement.querySelector(config.submitButtonSelector);
      
      inputList.forEach((inputElement) => {
        inputElement.addEventListener("input", () => {
        checkInputValidity(formElement, inputElement, config);
        toggleButtonState(inputList, buttonElement, config);
        });
      });
    });
  }

  function resetValidation(formElement, config) {
    const inputList = Array.from(formElement.querySelectorAll(config.inputSelector));
    const buttonElement = formElement.querySelector(config.submitButtonSelector);
  
    inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, config);
    });
  
    toggleButtonState(inputList, buttonElement, config);
  }

  function hideInputError(formElement, inputElement, config) {
    const errorElement = inputElement.closest("label").querySelector(".form__input-error");
    inputElement.classList.remove(config.inputErrorClass);
    errorElement.textContent = "";
    errorElement.classList.remove(config.errorClass);
  }

  function showInputError(formElement, inputElement, errorMessage, config) {
    const errorElement = inputElement.closest("label").querySelector(".form__input-error");
    inputElement.classList.add(config.inputErrorClass);
    errorElement.textContent = errorMessage;
    errorElement.classList.add(config.errorClass);
  }
  
  function toggleButtonState(inputList, buttonElement, config) {
    const hasInvalidInput = inputList.some((input) => !input.validity.valid);
  
    if (hasInvalidInput) {
      buttonElement.classList.add(config.inactiveButtonClass);
      buttonElement.disabled = true;
    } else {
      buttonElement.classList.remove(config.inactiveButtonClass);
      buttonElement.disabled = false;
    }
  }

  function checkInputValidity(formElement, inputElement, config) {
    if (!inputElement.validity.valid) {
      showInputError(formElement, inputElement, inputElement.validationMessage, config);
    } else {
      hideInputError(formElement, inputElement, config);
    }
  }
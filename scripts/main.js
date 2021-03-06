// MARK: Global Variables
let contactsArr = []
let filterby = 'all'
let isEditing = false
let timeout = null
let resizeTimer;

// MARK: Generate Test Data
data.forEach(element => {
    const name = new Name(element['firstName'], element['lastName'])

    const number = element['phoneNumber'].replace(/[-]/gi, '')
    const countryCode = '+' + element['countryCode']
    const type = Math.random > 0.5 ? 'mobile' : 'work'
    let phoneNumber = new PhoneNumber(type, countryCode, number)

    const emailType = Math.random > 0.5 ? 'private' : 'work'
    let email = new Email(emailType, element['emailAddress'].toLowerCase().replace('_', ''))

    const addressType = Math.random > 0.5 ? 'home' : 'work'
    let address = new Address(addressType, element['streetName'], String(element['houseNumber']), element['zip'], element['city'], element['country'])
    let datesArr = element['bday'].split('/')
    for (i = 0; i <datesArr.length; i++){
        if (datesArr[i].length === 1){
            datesArr[i] = '0' + datesArr[i]
        }
    }
    const bday = datesArr[1] + '.' + datesArr[0] + '.' + datesArr[2]

    contactsArr.push(new Contact(name, phoneNumber, address, email, bday, element['note']))
});
let name = new Name('David', 'Burghoff')
let phoneNumber = new PhoneNumber('mobile', '+49', '15778829514')
let address = new Address('home', 'Länderallee', '22', '14052', 'Berlin', 'Germany')
let emailAddress = new Email('private', 'burghoffdavid@gmail.com')
let myContact = new Contact(name, phoneNumber, address, emailAddress, '06.05.1997', 'Some short contact note')
contactsArr.push(myContact)


// MARK: DOM constants 
const addContactButton = document.querySelector('.add-contact')
const contactCardsContainer = document.querySelector('.cards-container')
const filterByInput = document.querySelector('.search-by-input')
const searchBar = document.querySelector('.search-bar')
const gridContainer = document.querySelector('.grid-wrapper')
const sortByInput = document.querySelector('.sort-by-input')
const ascDesc = document.querySelector('.asc-desc')
const submitButton = document.querySelector('.btn')

// MARK: DOM Event Listeners
addContactButton.addEventListener('click', openForm)
filterByInput.addEventListener('change', changeSearchFilterBy)
searchBar.addEventListener('keyup', function () {
    clearTimeout(timeout)
    timeout = setTimeout(function () {
        searchContacts()
    }, 500)
})
searchBar.addEventListener('search', searchContacts)
sortByInput.addEventListener('change', sortContacts)
ascDesc.addEventListener('change', sortContacts)
submitButton.onclick = addNewContact
//stop animations when rezising window
window.addEventListener("resize", () => {
    document.body.classList.add("resize-animation-stopper");
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      document.body.classList.remove("resize-animation-stopper");
    }, 400);
 });
  

// MARK: Generate initial contact Cards 
generateContactCards(contactCardsContainer, contactsArr)

// MARK: Open Create/Edit Contact Form
function openForm(contactToEdit) {
    // show popup and blur/darken background
    document.querySelector('#popupForm').style.display = 'block'
    document.querySelector('.main-content').classList.add('blur')

    if (isEditing) {
        let inputForms = gridContainer.querySelectorAll('input, select')
        gridContainer.id = contactToEdit.metaData.id
        const contactToEditData = contactToEdit.data
        inputForms[0].value = contactToEditData.name.firstName
        inputForms[1].value = contactToEditData.name.lastName
        inputForms[2].value = contactToEditData.phoneNumber.type
        inputForms[3].value = contactToEditData.phoneNumber.countryCode
        inputForms[4].value = contactToEditData.phoneNumber.number
        inputForms[5].value = contactToEditData.address.type
        inputForms[6].value = contactToEditData.address.streetName
        inputForms[7].value = contactToEditData.address.houseNumber
        inputForms[8].value = contactToEditData.address.zip
        inputForms[9].value = contactToEditData.address.city
        inputForms[10].value = contactToEditData.address.country
        inputForms[11].value = contactToEditData.email.type
        inputForms[12].value = contactToEditData.email.emailAddress
        inputForms[13].value = formatStringtoDate(contactToEditData.bday)
        inputForms[14].value = contactToEditData.note
    }
}
function formatStringtoDate(date){
    dateArr = date.split('.')
    return  dateArr[2] + '-' + dateArr[1] +'-' + dateArr[0]
}
// MARK: Close Create/Edit Contact Form
function closeForm() {
    document.querySelector('#popupForm').style.display = 'none'
    document.querySelector('.main-content').classList.remove('blur')

    resetInputForms()
}
// Reset Forms inputs
function resetInputForms() {
    let inputForms = gridContainer.querySelectorAll('input, select')
    inputForms.forEach(form => {
        if (form.id !== 'phoneNumberType' && form.id !== 'addressType' && form.id !== 'emailType') {
            form.value = ''    
        } 
    })
    // Reset Form Button and header
    if (isEditing) {
        isEditing = false
        submitButton.textContent = 'Create'
        document.querySelector('.form-header').textContent = 'Create New Contact'
        submitButton.onclick = addNewContact
    }
}
// MARK: Create New Contact Function
function addNewContact() {
    //Create new ContactCard
    const newContact = createContact()
    if (!newContact) {
        return
    }
    const newContactCard = generateCardElement(newContact)

    //Animate Insertion of new Contact Card
    newContactCard.classList.add('on-appear')
    newContactCard.style.transform = 'scale(0.00001)'
    setTimeout(function () {
        newContactCard.style.transform = ''
        newContactCard.classList.remove('on-appear')
    }, 500)

    //Insert Contact Card Div into contactsCardsContainer and contact Object into contactsArr
    const firstCard = contactCardsContainer.children[0]
    contactCardsContainer.insertBefore(newContactCard, firstCard)
    contactsArr.unshift(newContact)
    closeForm()
}
// MARK: Edit existing Contact
function editContact() {
    // Contact Object manipulation
    let editedContact = createContact() //create new Contact based on form inputs
    if (!editContact) {
        return
    } // return if new Contact is not valid
    const oldContact = contactsArr.find(contact => contact.metaData.id === gridContainer.id) // get old Contact
    gridContainer.id = ''
    editedContact.metaData = oldContact.metaData // set metaData of editetContact to old metaData(id, timeStamp)
    //DOM Element manipulation, replace old(unedited) Card with new (edited) card
    const newCardDiv = generateCardElement(editedContact)
    const oldCardDiv = document.getElementById(editedContact.metaData.id)
    contactCardsContainer.replaceChild(newCardDiv, oldCardDiv)
    //Replace oldContact Object with new edited Contact Object 
    contactsArr.splice(contactsArr.findIndex(function (i) {
        return i.metaData.id === editedContact.metaData.id
    }), 1, editedContact)
    closeForm()
}
// MARK: createContact Object from Form Inputs
function createContact() {
    // Get all select and input elements
    const inputForms = gridContainer.querySelectorAll('input, select')
    //Create new Contact
    let countryCode = inputForms[3].value
    if (countryCode[0] !== '+') {countryCode = '+' + countryCode}
    const newName = new Name(inputForms[0].value, inputForms[1].value)
    const newPhoneNumber = new PhoneNumber(inputForms[2].value, countryCode, inputForms[4].value)
    const newAddress = new Address(inputForms[5].value, inputForms[6].value, inputForms[7].value, inputForms[8].value, inputForms[9].value, inputForms[10].value)
    const newEmailAddress = new Email(inputForms[11].value, inputForms[12].value)
    const newBday = formatDateToString(inputForms[13].value)
    const newNote = inputForms[14].value
    const newContact = new Contact(newName, newPhoneNumber, newAddress, newEmailAddress, newBday, newNote)
    if (validate(newContact) === false) {
        return
    }
    return newContact
}
function formatDateToString(date){
    dateArr = date.split('-')
    return dateArr[2] + '.' + dateArr[1] +'.' + dateArr[0]
}   
// MARK: Validate Contact
function validate(contact) {
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/
    const emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    let valid = true
    let alertText = ''
    if (contact.data.name.firstName === '' && contact.data.name.lastName === '') { //Validate: At least one Name
        alertText = 'Error: Please Enter at least a surname or a last Name'
        valid = false
    } else if (contact.data.phoneNumber.countryCode[0] !== '+' && contact.data.phoneNumber.countryCode !== '') { //Validate: valid country code
        alertText = 'Error: Please enter a valid phone number country code starting with a "+" '
        valid = false
    } else if (!emailRegex.test(contact.data.email.emailAddress) && contact.data.email.emailAddress !== '') { //Validate:: valid email address
        alertText = 'Error: Please enter a valid email address'
        valid = false
    }else if(!dateRegex.test(contact.data.bday) && contact.data.bday !== ''){
        alertText = 'Error: Please enter a valid birth Date: dd.mm.yyyy'
        valid = false
    } else if (contact.data.note.length >= 50 && contact.data.note !== '') { //Validate: Note of max 50 chars
        alertText = 'Error: Note to long, maximum of 50 characters'
        valid = false
    }
    if (!valid) {
        alert(alertText)
    }
    return valid
}

// MARK: Delete Contact Function
function deleteContact(e) {
    const id = e.target.id.substring(0, e.target.id.length - 6)
    let confirmDelete = confirm('Do you really want to delete this Contact?') // let User confirm deletion
    if (confirmDelete) {
        //Remove Contact Object from Array
        contactsArr.splice(contactsArr.findIndex(function (i) {
            return i.metaData.id === id
        }), 1)
        
        // Delete Contact Card Div from DOM and animate it
        let elementToDelete = document.getElementById(id)
        elementToDelete.classList.add('on-delete')
        setTimeout(function () {
            contactCardsContainer.removeChild(elementToDelete)
        
        }, 500)
    }
}

//MARK: Edit Contact Button Pressed
function editContactButtonPressed(e) {
    // Prepare Form for Editing Mode
    const id = e.target.id.substring(0, e.target.id.length - 4)
    const contactToEdit = contactsArr.find(contact => contact.metaData.id === id)
    isEditing = true
    document.querySelector('.form-header').textContent = 'Edit Contact'
    submitButton.onclick = editContact
    submitButton.textContent = 'Submit'
    openForm(contactToEdit)
}

// MARK: update search filter
function changeSearchFilterBy(e) {
    filterby = e.target.value
    searchContacts()
}

// MARK: Sort contactsArr
function sortContacts() {
    let sortBy = sortByInput.value
    let key1
    let key2
    let key3
    // change ascending descending select input, based on searching for names(surname, name) or Date added (timestamp)
    const selectChildren = ascDesc.children
    if (sortBy === 'timeStamp') {
        selectChildren[0].innerHTML = "Newest -> Oldest"
        selectChildren[0].value = "desc"
        selectChildren[1].innerHTML = "Oldest -> Newest"
        selectChildren[1].value = "asc"
        key1 = 'metaData'
        key2 = sortBy
    } else {
        selectChildren[0].innerHTML = "A --> Z"
        selectChildren[0].value = "asc"
        selectChildren[1].innerHTML = "Z --> A"
        selectChildren[1].value = "desc"
        key1 = 'data'
        key2 = 'name'
        key3 = sortBy
    }
    const sortAscDesc = ascDesc.value
    // sort ContactsArr based on user selection
    sortArr(contactsArr, sortAscDesc, key1, key2, key3)
    // Change order of Contact Cards Div Elements, based on sorted ContactsArr
    let cards = contactCardsContainer.children
    for (i = 0; i < contactsArr.length; i++) {
        const card = cards.namedItem(contactsArr[i].metaData.id)
        contactCardsContainer.insertBefore(card, cards[i])
    }
}

function sortArr(inputArr, sortAscDesc, key1, key2, key3) {
    // Sort ContactsArr based on selected sorting fields and selection of either ascending or descending order
    if (key3 === undefined) {
        inputArr.sort(function (a, b) {
            if (a[key1][key2] > b[key1][key2]) {

                return sortAscDesc === "desc" ? -1 : 1
            }
            if (a[key1][key2] < b[key1][key2]) {
                return sortAscDesc === "desc" ? 1 : -1
            }
            return 0
        })
    } else {
        inputArr.sort(function (a, b) {
            if (a[key1][key2][key3] > b[key1][key2][key3]) {
                return sortAscDesc === "desc" ? -1 : 1
            }
            if (a[key1][key2][key3] < b[key1][key2][key3]) {
                return sortAscDesc === "desc" ? 1 : -1
            }
            return 0
        })
    }
}

// MARK: Search contactsArr
function searchContacts() {
    // Unique Set to keep track of matching contacts
    const filteredContactsArr = new Set()
    const searchString = searchBar.value.toLowerCase()
    // loop through contacts and find matches 
    for (contact of contactsArr) {
        const contactData = contact.data
        for (key in contactData) {
            // skip key if searchby input is not left to the standatd all and the current loop key is not equal to the search key 
            if (filterby !== 'all' && filterby !== key) {
                continue
            }
            if (typeof contactData[key] === 'string') {
                const str = contactData[key].toLowerCase()
                if (str.includes(searchString)) {
                    filteredContactsArr.add(contact)
                    break
                }
            } else {
                for (key2 in contactData[key]) {
                    const str = contactData[key][key2].toLowerCase()
                    if (str.includes(searchString)) {
                        filteredContactsArr.add(contact)
                        break
                    }
                }
            }
        }
        // hide Contact Cards from DOM if they are not in filteredContactsArr Set
        const card = document.getElementById(contact.metaData.id)
        if (filteredContactsArr.has(contact)) {
            card.style.display = 'grid'
        } else {
            card.style.display = 'none'
        }
    }
}
// Generate Initial Test Contact Cards HTML elements, sort them afterwards
function generateContactCards(contactCardsContainer, inputArr) {
    contactCardsContainer.innerHTML = ''
    for (contact of inputArr) {
        contactCardsContainer.appendChild(generateCardElement(contact))
    }
    sortContacts()
}

function generateCardElement(contact) {
    //create Empty CardElementDiv, assign class and ID
    let newDiv = document.createElement('div')
    newDiv.className = 'card-element'
    newDiv.id = contact.metaData.id

    //loop through contact objects and generate new rows for each data entry (name, email, phone number, etc...)
    for (key in contact.data) {
        // Add new Card Row to Card element
        newDiv.appendChild(generateCardRow(contact.data[key], contact.metaData.id))
    }
    //Return Card Element
    return newDiv
}

function generateCardRow(contactDataEntry, id) {
    // Create new Row Div, set icon, className, and append it to CardElement
    let newCardRowDiv = document.createElement('div')
    newCardRowDiv.className = 'card-row'
    let icon = document.createElement('img')
    icon.src = `images/${key}.svg`
    icon.className = 'row-icon'
    newCardRowDiv.appendChild(icon)
    // generate Text to go into card row div
    let text = generateCardRowText(contactDataEntry)
    // Create new P Element, add it to Card Row Div
    let newPContent = document.createElement('p')
    newPContent.className = 'contact-row-content'
    newPContent.innerHTML = text
    // check for p elements with no Data 
    let puretext = newPContent.innerHTML.replace(/<\/?[^>]+(>|$)/g, "").trim()
    if (puretext === '' || puretext === 'home' || puretext === 'mobile' || puretext === 'private' || puretext === 'work') {
        newPContent.innerHTML = '/'
    }
    // append p element to card row
    newCardRowDiv.appendChild(newPContent)
    // Add Edit and Delete Icon
    if (key === 'name') {
        let deleteButton = document.createElement('button')
        deleteButton.className = 'delete-contact-button'
        deleteButton.onclick = deleteContact
        deleteButton.id = id + 'delete'
        newCardRowDiv.appendChild(deleteButton)
    } else if (key === 'phoneNumber') {
        let editButton = document.createElement('button')
        editButton.className = 'edit-contact-button'
        editButton.onclick = editContactButtonPressed
        editButton.id = id + 'edit'
        newCardRowDiv.appendChild(editButton)
    }
    return newCardRowDiv
}

function generateCardRowText(contactDataEntry) {
    let text = ''
    if (typeof contactDataEntry === 'string') {
        text += contactDataEntry
    } else {
        for (key2 in contactDataEntry) {
            //insert mailto and tel Link
            if (key2 === 'countryCode') {
                text += `<a title="Call this Number" href = 'tel:${contactDataEntry.countryCode}${contactDataEntry.number}'>`
            } else if (key2 === 'emailAddress' && contactDataEntry[key2] !== '') {
                text += `<a title="New email to this address" href = 'mailto:${contactDataEntry[key2]}'>`
            } else if (key2 === 'streetName') {
                text += `<a target="_blank" title="Open Address in Google Maps" href ='https://www.google.com/maps/place/${contactDataEntry[key2]}+${contactDataEntry.houseNumber}+${contactDataEntry.zip}+,${contactDataEntry.city},+${contactDataEntry.country}/'>`
            } else if (key2 === 'type') {
                text += '<em>'
            }
            // add visible Text
            text += contactDataEntry[key2]

            //insert spaces
            if (key2 === 'streetName' || key2 === 'zip' || key2 === 'countryCode' || key2 === 'firstName') {
                text += ' '
            }
            // insert linebreaks
            if (key2 === 'type' || key2 === 'city' || key2 === 'houseNumber') {
                if (key2 === 'type') {
                    text += '</em>'
                }
                text += '<br>'
            }
            // close tel and mailto href tag
            if (key2 === 'number' || key2 === 'emailAddress' || key2 === 'country') {
                text += '</a>'
            }
        }
    }
    return text
}
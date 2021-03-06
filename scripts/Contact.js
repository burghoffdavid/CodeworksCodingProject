    class Contact {
        constructor(name, phoneNumber, address, email, bday, note) {
            this.metaData = new MetaData()
            this.data = new Data(name, phoneNumber, address, email, bday, note)
        }
    }
    class MetaData {
        constructor() {
            this.id = uuidv4()
            this.timeStamp = performance.now()
        }

    }
    class Data {
        constructor(name, phoneNumber, address, email, bday, note) {
            this.name = name,
                this.phoneNumber = phoneNumber,
                this.address = address,
                this.email = email,
                this.bday = bday,
                this.note = note
        }
    }
    class Name {
        constructor(firstName, lastName) {
            this.firstName = firstName
            this.lastName = lastName
        }
    }
    class PhoneNumber {
        constructor(type, countryCode, number) {
            this.type = type
            this.countryCode = countryCode
            this.number = number
        }
    }

    class Address {
        constructor(type, streetName, houseNumber, zip, city, country) {
            this.type = type
            this.streetName = streetName
            this.houseNumber = houseNumber
            this.zip = zip
            this.city = city
            this.country = country
        }
    }
    class Email {
        constructor(type, emailAddress) {
            this.type = type
            this.emailAddress = emailAddress
        }
    }
    // Not my function, courtesy of stackoverflow user "broofa", URL: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    function uuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
function validateEmail(string) {
    if (/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(string)) {
        return true;
    }
    return false;
}

function updateProgressBar(raisedAmount, goalAmount, donors, progressBarId, raisedId, goalId, donorsId) {
    const progressBar = document.getElementById(progressBarId);
    const raisedElement = document.getElementById(raisedId);
    const goalElement = document.getElementById(goalId);
    const donorsElement = document.getElementById(donorsId);

    // Update the displayed values dynamically
    raisedElement.textContent = raisedAmount;
    goalElement.textContent = goalAmount;
    donorsElement.textContent = donors + " Donors";

    // Calculate the progress percentage
    const progressPercentage = (raisedAmount / goalAmount) * 100;

    // Animate the progress bar width
    setTimeout(() => {
        progressBar.style.width = progressPercentage + "%";
    }, 200); // Small delay for animation
}
// Call the function after the window loads
window.onload = () => {
    updateProgressBar(3000, 5000, 220, "progress-bar", "raised-1", "goal-1", "donors-1");
};



//Address finder function
// Refer to https://addressfinder.com.au/docs/guide-custom-website-integration/ for more information
(function () {

    const address_key = 'RC9G6UM7PVEQLNJA4FBD' //Modify value with own key 




    var widget, initAddressFinder = function () {
        widget = new AddressFinder.Widget(
            document.getElementById('MailingStreet'), //Main address field
            address_key,
            'AU', {
            "address_params": {
                "post_box": "0",
                "source": "gnaf,paf"
            }
        }
        );


        //Change address field inputs and flashes Alpine form data
        widget.on('address:select', function (fullAddress, metaData) {
            document.getElementById('MailingStreet').value = metaData.address_line_combined;
            document.getElementById('MailingStreet').dispatchEvent(new Event('input'));
            document.getElementById('MailingCity').value = metaData.locality_name;
            document.getElementById('MailingCity').dispatchEvent(new Event('input'));
            document.getElementById('MailingState').value = metaData.state_territory;
            document.getElementById('MailingState').dispatchEvent(new Event('input'));
            document.getElementById('MailingPostalCode').value = metaData.postcode;
            document.getElementById('MailingPostalCode').dispatchEvent(new Event('input'));
        });
    };

    function downloadAddressFinder() {
        var script = document.createElement('script');
        script.src = 'https://api.addressfinder.io/assets/v3/widget.js';
        script.async = true;
        script.onload = initAddressFinder;
        document.body.appendChild(script);
    };

    document.addEventListener('DOMContentLoaded', downloadAddressFinder);
})();


//Donation form
document.addEventListener('alpine:init', () => {
    Alpine.data('form', () => ({
        amount: 75,
        choice: '',
        total: 0,

        amountDefaults: {
            'Monthly': 40,
            'One-off': 100
        },
        amountOptions: {
            'Monthly': ['20', '50', '75', '100', 'other'],
            'One-off': ['20', '50', '75', '100', 'other']
        },

        frequency: 'Monthly',
        name_first: '',
        name_last: '',
        phone: '',
        email: '',

        company: '',

        payment_by: 'Individual',

        mailing_street: '',
        mailing_city: '',
        mailing_state: '',
        mailing_postal_code: '',
        mailing_country: 'AU',

        _errors: {},

        _loaded: false,
        _max: 1,
        _submit: false,
        _stage: 1,

        init() {
            this.total = this.amount; // define total

            document.getElementById("stg1complete").style.display = "none";
            document.getElementById("stg1future").style.display = "none";
            document.getElementById("stg2current").style.display = "none";
            document.getElementById("stg2complete").style.display = "none";
            document.getElementById("stg3current").style.display = "none";
            document.getElementById("stg3complete").style.display = "none";

            this.$watch('frequency', (frequency) => {
                // includes the amount in that frequency
                if (!this.amountOptions[frequency].includes(this.amount)) {
                    this.$nextTick(() => {
                        this.amount = this.amountDefaults[frequency]
                    })
                }
            });

            //Watch changes to input values
            this.$watch('amount', (amount) => {
                this.total = amount;

                if (amount == 'other') {
                    this.$refs['choice'].focus();
                } else {
                    this.choice = '';
                }
            });
            this.$watch('choice', (amount) => {
                this.total = amount;
            });
            this.$watch('name_first', (value) => {
                this._errors.name_first = !value;
            });
            this.$watch('name_last', (value) => {
                this._errors.name_last = !value;
            });
            this.$watch('phone', (value) => {
                this._errors.phone = false;
                if (this.isMonthly) {
                    this._errors.phone = !value;
                }
            });
            this.$watch('email', (value) => {
                this._errors.email = !value;
            });

            this.$watch('mailing_street', (value) => {
                this._errors.mailing_street = false;
                if (this.isMonthly) {
                    this._errors.mailing_street = !value;
                }
            });
            this.$watch('mailing_city', (value) => {
                this._errors.mailing_city = false;
                if (this.isMonthly) {
                    this._errors.mailing_city = !value;
                }
            });
            this.$watch('mailing_state', (value) => {
                this._errors.mailing_state = false;
                if (this.isMonthly) {
                    this._errors.mailing_state = !value;
                }
            });
            this.$watch('mailing_postal_code', (value) => {
                this._errors.mailing_postal_code = false;
                if (this.isMonthly) {
                    this._errors.mailing_postal_code = !value;
                }
            });




            window.onpopstate = (event) => {
                if (this._submit) {
                    // form was submitted
                    history.go(-2);
                }
            };

        },

        get isMonthly() {
            return this.frequency === 'Monthly';
        },

        goTo(stage) {
            // only allow to switch if we have visited it once
            if (stage <= this._max) {
                this.switchStage(stage);
            }
        },

        progress() {
            this.switchStage(this._stage + 1);

        },

        switchStage(nextStage) {
            // already on the same stage
            if (this._stage == nextStage) {
                return;
            }

            //Change progress bar images
            if (nextStage == 1) {
                document.getElementById("stg1current").style.display = "block";
                document.getElementById("stg1complete").style.display = "none";
                document.getElementById("stg1future").style.display = "none";
                document.getElementById("stg2current").style.display = "none";
                document.getElementById("stg2complete").style.display = "none";
                document.getElementById("stg2future").style.display = "block";
                document.getElementById("stg3current").style.display = "none";
                document.getElementById("stg3complete").style.display = "none";
                document.getElementById("stg3future").style.display = "block";
            }
            if (nextStage == 2) {
                document.getElementById("stg1current").style.display = "none";
                document.getElementById("stg1complete").style.display = "block";
                document.getElementById("stg1future").style.display = "none";
                document.getElementById("stg2current").style.display = "block";
                document.getElementById("stg2complete").style.display = "none";
                document.getElementById("stg2future").style.display = "none";
                document.getElementById("stg3current").style.display = "none";
                document.getElementById("stg3complete").style.display = "none";
                document.getElementById("stg3future").style.display = "block";
            }
            if (nextStage == 3 && this._stage == 1 && this._max > 2) {
                document.getElementById("stg1current").style.display = "none";
                document.getElementById("stg1complete").style.display = "block";
                document.getElementById("stg1future").style.display = "none";
                document.getElementById("stg2current").style.display = "none";
                document.getElementById("stg2complete").style.display = "block";
                document.getElementById("stg2future").style.display = "none";
                document.getElementById("stg3current").style.display = "block";
                document.getElementById("stg3complete").style.display = "none";
                document.getElementById("stg3future").style.display = "none";
            }


            // reset errors
            this._errors = {};

            // validate
            if (this._stage == 2 && nextStage > this._stage) {
                if (!this.name_first) {
                    this._errors.name_first = true;
                }

                if (!this.name_last) {
                    this._errors.name_last = true;
                }

                if (!this.email || !validateEmail(this.email)) {
                    this._errors.email = true;
                }
                if (this.isMonthly) {
                    if (!this.phone) {
                        this._errors.phone = true;
                    }
                    if (!this.mailing_street) {
                        this._errors.mailing_street = true;
                    }
                    if (!this.mailing_city) {
                        this._errors.mailing_city = true;
                    }
                    if (!this.mailing_state) {
                        this._errors.mailing_state = true;
                    }
                    if (!this.mailing_postal_code) {
                        this._errors.mailing_postal_code = true;
                    }
                }

                if (Object.keys(this._errors).length) {
                    return;
                }
                else {
                    if (nextStage == 3) {
                        document.getElementById("stg1current").style.display = "none";
                        document.getElementById("stg1complete").style.display = "block";
                        document.getElementById("stg1future").style.display = "none";
                        document.getElementById("stg2current").style.display = "none";
                        document.getElementById("stg2complete").style.display = "block";
                        document.getElementById("stg2future").style.display = "none";
                        document.getElementById("stg3current").style.display = "block";
                        document.getElementById("stg3complete").style.display = "none";
                        document.getElementById("stg3future").style.display = "none";
                    }
                }
            }


            // get the wrapper
            let wrapper = this.$refs['wrapper'];

            // set the actual height of the current section
            const el = this.$refs['stage-' + this._stage];
            if (el) {
                wrapper.style.height = el.offsetHeight + 'px';
            } else {
                wrapper.style.height = '0px';
            }

            // set the stage
            this._stage = nextStage;

            // update max
            if (this._stage > this._max) {
                this._max = this._stage;
            }

            // are we on to the form?
            if (this._stage == 3) {
                window.history.pushState("donate", null, null);
                this.$refs['donationIntroForm'].submit();
                this._submit = true;
                // document.getElementById('stage3img').src = "images/progress complete.svg";
            } else {
                this._submit = false;
                this._loaded = false;
            }

            this.$nextTick(() => {
                // get the height of the new section
                const newEl = this.$refs['stage-' + this._stage];
                if (newEl) {
                    wrapper.style.height = newEl.offsetHeight + 'px';
                }

                // after animation, remove wrapper's height
                setTimeout(() => {
                    wrapper.style.height = '';
                }, 300);

                setTimeout(() => {
                    document.getElementById('demo-form-top').scrollIntoView({
                        behavior: 'smooth',
                    });
                }, 500);
            });
        },





        formLoaded(event) {
            if (this._stage == 3) {
                this._loaded = true;
            }
        }
    }));
});
// 'Create Wallet' Button Click
$("#create-wallet").click(function() {
    $("#old-wallet").hide();
    $("#new-wallet").show();
    $("#output-area").html("");
})

// Network Selection & 'Confirm' Button Click
$("#new-wallet-form").on('submit', function(e) {
    e.preventDefault(e);
    var network = $('input[name=network]:checked').val();
    bitcoin.NewWallet(network).then(function() {
        $('#new-wallet-form')[0].reset();
        $('#new-wallet').hide();
        $('#output-area').html(generateNewWalletInfo());
        $('#entry').hide();
        $('#header-1').hide();
        $('#header-2').show();
    });
})

// New wallet Confirmation
$('#output-area').on('click', '#confirm-key', function(e) {
    $('#output-area').html(generateWalletUI());
    updateBtcBalance();
})

// Make Transaction
$('#output-area').on('click', '#tx-form #send-button', function(e) {
    e.preventDefault(e);

    var amount = $('input[name="btc"]').val();
    var addr = $('input[name="addr"]').val();

    if (amount <= 0 || Number.isNaN(amount)) {
        displayAlert("danger", "Please enter valid amount!");
        return;
    }

    bitcoin.ShowBalance().then(function(balance) {
        if (amount > balance) {
            displayAlert("danger", "Not enough bitcoin in account!");
        } else {
            return bitcoin.SendBitcoin(amount, addr);
        }
    }).then(function(result) {
        if (result === undefined) {
            displayAlert("danger", "Error! Invalid Address or Amount!");
        } else {
            displayAlert("success", "Success! TX ID: " + result);
            $('#tx-form')[0].reset();
        }
    }).catch(function(err){
        displayAlert("danger", "Unable to send TX!");
        console.log(err);
        console.log(amount, addr);
    });
})

// Cancel Transaction
$('#output-area').on('click', '#tx-form #cancel-button', function(e) {
    e.preventDefault(e);

    $("#old-wallet").hide();
    $("#header-2").hide();
    $("#header-1").show();
    $("#entry").show();
    $("#alert-msg").hide();
    $("#output-area").html("");
})
$('#old-wallet').on('click', '#old-wallet-form #cancel-button', function(e) {
    e.preventDefault(e);

    $("#old-wallet").hide();
    $("#header-2").hide();
    $("#header-1").show();
    $("#entry").show();
    $("#alert-msg").hide();
    $("#output-area").html("");
})


// 'Restore Wallet' Button Click
$('#import-wallet').click(function() {
    $("#old-wallet").show();
    $("#new-wallet").hide();
    $("#output-area").html("");
})

// Private Key Input & 'Unlock' Button Click
$('#old-wallet-form').on('submit', function(e) {
    $('#entry').hide();
    $('#header-1').hide();
    $('#header-2').show();
    
    e.preventDefault(e);
    var key = $('input[name="cipher"]').val();

    bitcoin.NewWallet("", key).then(function(wallet) {
        if (wallet.privateKey === key) {
            $('#old-wallet-form')[0].reset();
            $('#old-wallet').hide();
            $('#output-area').html(generateWalletUI());
            updateBtcBalance();
        } else {
            displayAlert("danger", "Not a valid key, only WIF-compressed format is supported!");
        }
    }).catch(function(err) {
        displayAlert("danger", err);
    });
})

//==============================
// Helper Functions
//==============================

function displayAlert(type, msg) {
    var alert = `
        <div class='alert alert-dismissible alert-${type}'>
            <p>${msg}</p>
            <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
        </div>
    `;
    $('#alert-msg').append(alert);
}

function generateNewWalletInfo() {
    var html = `
        <h4>Your private key is the "password" to your wallet, so be sure to write it down!</h4>
        <div class='key-info'>${bitcoin.ShowWallet().privateKey}</div>
        <button id='confirm-key' type='submit'>D O N E</button>
    `;
    return html;
}


function generateWalletUI() {
    var html = `
        <h5 id='btc-balance'>Balance: 0</h5>
        <h5>Address: ${bitcoin.ShowWallet().address}</h5>

        <form id='tx-form'>
            <div class='form-group'>
                <input type='number' min='0' step='any' name='btc' placeholder='Amount in BTC' class='form-control'>
                <input type='text' name='addr' placeholder='Recipient Address' class='form-control'>
            </div>
            <button type='submit' id='cancel-button'>Cancel</button>
            <button type='submit' id='send-button'>Send</button>
        </form>
    `;
    return html;
}

function round(x, n) {
    let y = Math.round(x * (10**n))/(10**n);
    return y;
}


function updateBtcBalance() {
    bitcoin.ShowBalance().then(function(balance) {
        bitcoin.api.FetchRate().then(function(rate) {
            let balanceinbtc = round(balance, 4);
            let balanceinusd = round(balanceinbtc/1000 * rate, 2);
            $('#btc-balance').html("Balance: " + balanceinbtc + " mBTC (" + balanceinusd + " USD)");
        })
    })
}
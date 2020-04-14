// Your web app's Firebase configuration

var firebaseConfig = {
    apiKey: "AIzaSyCqAvUiMxbCSWYq-FkjsxnF4QTBOGkUbrM",
    authDomain: "mathquizz-629be.firebaseapp.com",
    databaseURL: "https://mathquizz-629be.firebaseio.com",
    projectId: "mathquizz-629be",
    storageBucket: "mathquizz-629be.appspot.com",
    messagingSenderId: "1093342957316",
    appId: "1:1093342957316:web:ef925a34cd5f89adf90a51"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();
var auth = firebase.auth();

firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
        window.location = "login.html";
    }
});


//view data soal
function dataSoal() {
    listenerSoal = db.collection("soal").orderBy("created_at", "asc").get().then((querySnapshot) => {
        var array = [];
        var count = 1;
        querySnapshot.forEach((doc) => {
            var data = doc.data();
            var data_arr = [];
            data_arr.push(count++);
            data_arr.push(doc.id);
            data_arr.push(data.tipe === 1 && data.tipe > 0 ? "Latihan" : "Quizz");
            data_arr.push(data.pertanyaan.replace(/\<br>/g, '\n'));
            var huruf = ["tidak diketahui", "a", "b", "c", "d", "e"];
            data_arr.push(huruf[data.jawaban_benar]);
            data_arr.push(data.daftar_jawaban[0]);
            data_arr.push(data.daftar_jawaban[1]);
            data_arr.push(data.daftar_jawaban[2]);
            data_arr.push(data.daftar_jawaban[3]);
            data_arr.push(data.daftar_jawaban[4]);
            data_arr.push("<button data-id='" + doc.id + "' class='btn btn-danger deleteSoal'>delete</button><br>"
                + "<button data-id='" + doc.id + "' class='btn btn-warning editSoal'>test</button>");
            array.push(data_arr);
        });
        console.log(array);
        var table = $('#dataSoal');
        if (table.DataTable() != undefined && table.DataTable() != null) {
            table.DataTable().destroy();
        }
        table.DataTable({
            data: array,
            columns: [
                { tittle: "No" },
                { tittle: "ID Soal" },
                { tittle: "Tipe Soal" },
                { tittle: "Pertanyaan" },
                { tittle: "Jawaban benar" },
                { tittle: "Jawaban Opsi A" },
                { tittle: "Jawaban Opsi B" },
                { tittle: "Jawaban Opsi C" },
                { tittle: "Jawaban Opsi D" },
                { tittle: "Jawaban Opsi E" },
                { tittle: "Action" }
            ]
        });
    });
}


//add Soal
$(document).on("click", "#addSoal button", function (e) {
    e.preventDefault();
    var data = $("#addSoal").serializeArray();
    var id = btoa(Math.random()).slice(0, 20)
    console.log(data);
    db.collection("soal").doc(id).set(
        {
            id: id,
            tipe: parseInt(data[0].value),
            pertanyaan: data[1].value.replace(/\n/g, '<br>'),
            jawaban_benar: parseInt(data[2].value),
            daftar_jawaban: [data[3].value, data[4].value, data[5].value, data[6].value, data[7].value],
            created_at: firebase.firestore.Timestamp.fromDate(new Date())
        }
    ).then(function () {
        console.log("Document successfully written!");
        alert("sukses menambah soal");
    })
        .catch(function (error) {
            console.error("Error writing document: ", error);
            alert("gagal menambah soal");
        });
    $("#addSoal")[0].reset();
});

//delete Soal
$(document).on("click", ".deleteSoal", function () {
    db.collection("soal").doc($(this).data("id")).delete().then(function () {
        console.log("Document successfully deleted!");
        alert("sukses menghapus soal");
    }).catch(function (error) {
        console.error("Error removing document: ", error);
        alert("sukses menghapus soal");
    });
});

//edit
$(document).on("click", ".editSoal", function () {
    console.log($(this).data("id"));
});

//view data result
function dataHasilBelajar() {
    db.collection("result").get().then((querySnapshot) => {
        console.log(querySnapshot);
        var quizhtml = "";
        var latihanhtml = "";
        querySnapshot.forEach((doc) => {
            var data = doc.data();
            var html = '<div class="col-xl-6 col-md-6 mb-6 my-2">'
                + '<div class="card border-left-info shadow h-100 py-2">'
                + '<div class="card-body">'
                + '<div class="row no-gutters align-items-center">'
                + '<div class="col mr-2">'
                + '<div class="text-lg font-weight-bold text-success mb-1">' + formatedDate(data.create_at.toDate()) + '</div>'
                + '<div class="text-xs font-weight-bold text-info mb-1">ID Quizz : ' + doc.id + '</div>'
                + '<div class="text-xs font-weight-bold text-warning mb-1">ID Siswa : ' + data.userid + '</div>'
                + '<span>Total waktu pengerjaan: ' + dateconvert(data.timestampTotal) + '</span>'
                + '<table class="table table-bordered table-responsive">'
                + '<thead>'
                + '<th>No</th>'
                + '<th>ID Soal</th>'
                + '<th>Jawaban</th>'
                + '<th>Waktu</th>'
                + '</thead>'
                + '<tbody>';
            var count = 1;
            var huruf = ["tidak dijawab", "a", "b", "c", "d", "e"]
            data.jawabanModels.forEach((object) => {
                html += '<tr>'
                    + '<td>' + count++ + '</td>'
                    + '<td>' + object.idSoal + '</td>'
                    + '<td>' + huruf[object.jawaban] + '</td>'
                    + '<td>' + dateconvert(object.timestamp) + '</td>'
                    + '</tr>';
            })
            html += '</tbody>'
                + '</table>'
                + '</div>'
                + '</div>'
                + '</div>'
                + '</div>'
                + '</div>';
            if (data.tipeSoal === 1) {
                latihanhtml += html;
            } else {
                quizhtml += html;
            }
        });
        $('#container-dataQuizz').html(quizhtml);
        $('#container-dataLatihan').html(latihanhtml);
    });
}

//sign out
$(document).on('click', '#logout', function () {
    auth.signOut().then(function () {
        window.location = "login.html";
    }, function (error) {
        // An error happened.
    });
});

//view data pengantar
function dataPengantar() {
    db.collection("aplikasidata").doc("pengantar").get().then((doc) => {
        const data = doc.data();
        $('#pengantar-uraian1').val(data.data.replace(/\<br>/g, '\n'));
    });
}

//simpan pengantar
$(document).on('click', '#simpanPengantar', function () {
    console.log($('#pengantar-uraian1').val());
    db.collection("aplikasidata").doc("pengantar").update({
        data: $('#pengantar-uraian1').val().replace(/\n/g, '<br>')
    })
        .then(function () {
            console.log("Document successfully written!");
            alert("sukses mengubah pengantar");
        })
        .catch(function (error) {
            console.error("Error writing document: ", error);
            alert("gagal mengubah pengantar");
        });
})

//view data motivasi
function dataMotivasi() {
    db.collection("aplikasidata").doc("motivasi").get().then((doc) => {
        const data = doc.data();
        $('#motivasi-uraian1').val(data.data.replace(/\<br>/g, '\n'));
    });
}

//simpan motivasi
$(document).on('click', '#simpanMotivasi', function () {
    console.log($('#motivasi-uraian1').val());
    db.collection("aplikasidata").doc("motivasi").update({
        data: $('#motivasi-uraian1').val().replace(/\n/g, '<br>')
    })
        .then(function () {
            console.log("Document successfully written!");
            alert("sukses mengubah motivasi");
        })
        .catch(function (error) {
            console.error("Error writing document: ", error);
            alert("gagal mengubah motivasi");
        });
})

//view data petunjuk
function dataPetunjuk() {
    db.collection("aplikasidata").doc("petunjuk").get().then((doc) => {
        const data = doc.data();
        $('#petunjuk-uraian1').val(data.data.replace(/\<br>/g, '\n'));
    });
}

//simpan petunjuk
$(document).on('click', '#simpanPetunjuk', function () {
    console.log($('#petunjuk-uraian1').val());
    db.collection("aplikasidata").doc("petunjuk").update({
        data: $('#petunjuk-uraian1').val().replace(/\n/g, '<br>')
    })
        .then(function () {
            console.log("Document successfully written!");
            alert("sukses mengubah petunjuk");
        })
        .catch(function (error) {
            console.error("Error writing document: ", error);
            alert("gagal mengubah petunjuk");
        });
})

//view data petunjuk
function dataProfil() {
    db.collection("aplikasidata").doc("profil").get().then((doc) => {
        const data = doc.data();
        $('#imageProfil').attr("src", data.img_profil);
        $('#profil-nama').val(data.nama.replace(/\<br>/g, '\n'));
        $('#profil-agama').val(data.agama.replace(/\<br>/g, '\n'));
        $('#profil-ttl').val(data.ttl.replace(/\<br>/g, '\n'));
        $('#profil-motto').val(data.motto.replace(/\<br>/g, '\n'));
        $('#profil-email').val(data.email.replace(/\<br>/g, '\n'));
        $('#profil-pengalaman').val(data.pengalaman.replace(/\<br>/g, '\n'));
        $('#profil-jurusan').val(data.jurusanFakultas.replace(/\<br>/g, '\n'));
        $('#profil-alamat').val(data.alamat.replace(/\<br>/g, '\n'));
    });
}

//simpan profil
$(document).on('click', '#simpanProfil', function () {
    const ref = firebase.storage().ref();
    const file = document.querySelector('#profil-foto').files[0];
    const name = (+new Date()) + '-' + file.name;
    const metadata = {
        contentType: file.type
    };
    const task = ref.child(name).put(file, metadata);
    task
        .then(snapshot => snapshot.ref.getDownloadURL())
        .then((url) => {
            console.log(url);
            $('#imageProfil').attr("src", url);
            db.collection("aplikasidata").doc("profil").update({
                img_profil: url,
                nama: $('#profil-nama').val().replace(/\n/g, '<br>'),
                agama: $('#profil-agama').val().replace(/\n/g, '<br>'),
                ttl: $('#profil-ttl').val().replace(/\n/g, '<br>'),
                motto: $('#profil-motto').val().replace(/\n/g, '<br>'),
                email: $('#profil-email').val().replace(/\n/g, '<br>'),
                pengalaman: $('#profil-pengalaman').val().replace(/\n/g, '<br>'),
                jurusanFakultas: $('#profil-jurusan').val().replace(/\n/g, '<br>'),
                alamat: $('#profil-alamat').val().replace(/\n/g, '<br>')
            })
                .then(function () {
                    console.log("Document successfully written!");
                    alert("sukses mengubah profil");
                })
                .catch(function (error) {
                    console.error("Error writing document: ", error);
                    alert("gagal mengubah profil");
                });
        })
        .catch(console.error);
})

//convert date
function dateconvert(long) {
    var datetime = long; // anything
    var date = new Date(datetime);
    var h = date.getHours() - 7;
    var m = date.getMinutes();
    var s = date.getSeconds();
    if (h < 10) { h = "0" + h }
    if (m < 10) { m = "0" + m }
    if (s < 10) { s = "0" + s }
    return `${h}:${m}:${s}`;
}

function formatedDate(d) {
    dformat = [d.getDate() > 10 ? d.getDate() : "0" + d.getDate(),
    (d.getMonth() + 1) > 10 ? (d.getMonth() + 1) : "0" + (d.getMonth() + 1),
    d.getFullYear()].join('/') + ' ' +
        [d.getHours() > 10 ? d.getHours() : "0" + d.getHours(),
        d.getMinutes() > 10 ? d.getMinutes() : "0" + d.getMinutes(),
        d.getSeconds() > 10 ? d.getSeconds() : "0" + d.getSeconds()].join(':');
    return dformat;
}
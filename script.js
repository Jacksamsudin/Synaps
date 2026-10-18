
const STORAGE_KEY = "synapsTasks";

// data dummy
const defaultTasks = [
    {
        id: 1,
        judul: "Tugas 2 HTML",
        matakuliah: "Pemrograman Web",
        deadline: "2026-10-30",
        prioritas: "Tinggi",
        status: "Belum Selesai"
    },
    {
        id: 2,
        judul: "Implementasi KNN",
        matakuliah: "Artificial Intelligence",
        deadline: "2026-11-02",
        prioritas: "Sedang",
        status: "Belum Selesai"
    },
    {
        id: 3,
        judul: "Analisis Struktur Data",
        matakuliah: "Struktur Data",
        deadline: "2026-11-05",
        prioritas: "Rendah",
        status: "Selesai"
    }
];

let tasks = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "null"
) || defaultTasks;

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getSummary() {
    let completed = 0;

    for (const task of tasks) {
        if (task.status === "Selesai") {
            completed++;
        }
    }

    return {
        total: tasks.length,
        completed: completed,
        pending: tasks.length - completed
    };
}

function formatDate(date) {
    return new Date(date + "T00:00:00").toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function priorityClass(priority) {
    if (priority === "Tinggi") return "text-bg-danger";
    if (priority === "Sedang") return "text-bg-primary";
    return "text-bg-secondary";
}

function statusClass(status) {
    if (status === "Selesai") return "text-bg-success";
    if (status === "Sedang Dikerjakan") return "text-bg-info";
    return "text-bg-warning";
}

function renderDashboard() {
    const summary = getSummary();

    $("#totalTasks").text(summary.total);
    $("#pendingTasks").text(summary.pending);
    $("#completedTasks").text(summary.completed);

    const list = $("#dashboardTaskList");
    if (!list.length) return;

    list.empty();

    tasks.slice(-5).reverse().forEach(task => {
        const row = $("<tr>");

        $("<td>").text(task.judul).appendTo(row);
        $("<td>").text(task.matakuliah).appendTo(row);
        $("<td>").text(formatDate(task.deadline)).appendTo(row);

        $("<td>").append(
            $("<span>")
                .addClass("badge " + priorityClass(task.prioritas))
                .text(task.prioritas)
        ).appendTo(row);

        $("<td>").append(
            $("<span>")
                .addClass("badge " + statusClass(task.status))
                .text(task.status)
        ).appendTo(row);

        $("<td>").append(
            $("<a>").attr("href", "detail-tugas.html").text("Detail")
        ).appendTo(row);

        list.append(row);
    });
}

function renderTaskList() {
    const list = $("#taskList");
    if (!list.length) return;

    const keyword = ($("#searchTask").val() || "").toLowerCase();
    const status = $("#filterStatus").val() || "semua";

    const filtered = tasks.filter(task => {
        const matchesText =
            task.judul.toLowerCase().includes(keyword) ||
            task.matakuliah.toLowerCase().includes(keyword);

        const matchesStatus =
            status === "semua" || task.status === status;

        return matchesText && matchesStatus;
    });

    list.empty();

    filtered.forEach((task, index) => {
        const row = $("<tr>");

        $("<th>").text(index + 1).appendTo(row);
        $("<td>").text(task.judul).appendTo(row);
        $("<td>").text(task.matakuliah).appendTo(row);
        $("<td>").text(formatDate(task.deadline)).appendTo(row);

        $("<td>").append(
            $("<span>")
                .addClass("badge " + priorityClass(task.prioritas))
                .text(task.prioritas)
        ).appendTo(row);

        $("<td>").append(
            $("<span>")
                .addClass("badge " + statusClass(task.status))
                .text(task.status)
        ).appendTo(row);

        $("<td>").append(
            $("<button>")
                .attr("type", "button")
                .attr("data-id", task.id)
                .addClass("btn btn-sm btn-outline-danger delete-task")
                .text("Hapus")
        ).appendTo(row);

        list.append(row);
    });

    $("#taskEmpty").toggleClass("d-none", filtered.length > 0);
}

function showAlert(message, type) {
    $("#formAlert")
        .removeClass("d-none alert-success alert-danger")
        .addClass("alert-" + type)
        .text(message)
        .hide()
        .fadeIn(300);
}

$(document).ready(function () {
    renderDashboard();
    renderTaskList();

    // efek jQuery untuk menampilkan dan menyembunyikan tips
    $("#toggleTips").on("click", function () {
        $("#taskTips").slideToggle();
    });

    // pencarian dan filter tugas
    $("#searchTask").on("input", renderTaskList);
    $("#filterStatus").on("change", renderTaskList);

    // menghapus tugas dari daftar
    $("#taskList").on("click", ".delete-task", function () {
        const id = Number($(this).attr("data-id"));

        if (confirm("Yakin ingin menghapus tugas ini?")) {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTaskList();
            renderDashboard();
        }
    });

    // menambahkan tugas baru dari form
    $("#taskForm").on("submit", function (event) {
        event.preventDefault();

        const judul = $("#judul").val().trim();
        const matakuliah = $("#matakuliah").val();
        const deadline = $("#deadline").val();

        if (!judul || !matakuliah || !deadline) {
            showAlert("Mohon lengkapi judul, mata kuliah, dan deadline.", "danger");
            return;
        }

        tasks.push({
            id: Date.now(),
            judul: judul,
            deskripsi: $("#deskripsi").val().trim(),
            matakuliah: matakuliah,
            deadline: deadline,
            prioritas: $('input[name="prioritas"]:checked').val() || "Sedang",
            status: $("#status").val()
        });

        saveTasks();
        showAlert("Tugas berhasil ditambahkan!", "success");
        this.reset();

        setTimeout(function () {
            window.location.href = "detail-tugas.html";
        }, 1000);
    });
});

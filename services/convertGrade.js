const convertCheck1 = async (result_check1) => {
    let grade_check1;
    if (result_check1 === false) {
        grade_check1 = "Bad";
    }
    else {
        grade_check1 = "Excellent";
    }
    return grade_check1;
};

const convertCheck1_1 = async (result_check1_1) => {
    let grade_check1_1;
    if (result_check1_1 === false) {
        grade_check1_1 = "Bad";
    }
    else {
        grade_check1_1 = "Excellent";
    }
    return grade_check1_1;
}

const convertCheck2 = async (result_check2) => {
    let grade_check2;
    if (result_check2 === 'A' || 'B' || 'C' || 'D' || 'E') {
        grade_check2 = "Bad"
    }
    else {
        grade_check2 = "Excellent";
    }
    return grade_check2;
};

const convertCheck3 = async (result_check3) => {
    let grade_check3;

    if (result_check3 === "L1" || "L2" || "L3") {
        grade_check3 = "Bad";
    }
    else if (result_check3 === "L4") {
        grade_check3 = "Not Bad";
    }

    else if (result_check3 === "L5") {
        grade_check3 = "Normal";
    }

    else if (result_check3 === "L6") {
        grade_check3 = "Good";
    }

    else {
        grade_check3 = "Excellent";
    }

    return grade_check3;
};

const convertCheck6 = async (result_check6) => {
    let grade_check6;

    if (result_check6 >= 5) {
        grade_check6 = "Bad";
    }
    else if (result_check6 >= 4) {
        grade_check6 = "Not Bad";
    }

    else if (result_check6 >= 3) {
        grade_check6 = "Normal";
    }

    else if (result_check6 >= 2) {
        grade_check6 = "Good";
    }

    else {
        grade_check6 = "Excellent";
    }

    return grade_check6;
};

const convertCheck7 = async (result_check7) => {
    let grade_check7;

    if (result_check7 <= 0.1) {
        grade_check7 = "Bad";
    }
    else if (result_check7 >= 0.2 && result_check7 <= 0.4) {
        grade_check7 = "Not Bad";
    }

    else if (result_check7 >= 0.5 && result_check7 <= 0.7) {
        grade_result7 = "Normal";
    }

    else if (result_check7 >= 0.8 && result_check7 <= 0.9) {
        grade_result7 = "Good";
    }

    else {
        grade_result7 = "Excellent";
    }

    return grade_check7;
};

module.exports = { convertCheck1, convertCheck1_1, convertCheck2, convertCheck3, convertCheck6, convertCheck7 };


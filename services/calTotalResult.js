exports.calTotalNormalResult = async (result_check1, result_check1_1, result_check2, result_check3, result_check6, result_check7) => {
	var return_total_normal_result = '';

	console.log(result_check1, result_check6, result_check7);

	if (result_check1 === 'False') {
		return_total_normal_result = 'Bad';
		return return_total_normal_result;
	}

	if (result_check1 === 'True') {
		if (result_check1_1 === 'Bad' || result_check2 == 'Bad' || result_check6 === 'Bad' || result_check7 === 'Bad') {
			return_total_normal_result = 'Bad';
			return return_total_normal_result;
		}

		else if (result_check3 === 'Not_bad' || result_check6 === 'Not_bad' || result_check7 === 'Not_bad') {
			return_total_normal_result = 'Not_bad';
			return return_total_normal_result;
		}

		else if (result_check3 === 'Normal' || result_check6 === 'Normal' || result_check7 === 'Normal') {
			return_total_normal_result = 'Normal';
			return return_total_normal_result;
		}

		else if (result_check3 === 'Good' || result_check6 === 'Good' || result_check7 === 'Good') {
			return_total_normal_result = 'Good';
			return return_total_normal_result;
		}

		else {
			return_total_normal_result = 'Excellent';
			return return_total_normal_result;
		}
	}
}

exports.calTotalSimpleResult = async (result_check6, result_check7) => {
	var return_total_simple_result = '';

	console.log(result_check6, result_check7);

	if (result_check6 === 'Bad' || result_check7 === 'Bad') {
		return_total_result = 'Bad';
		return return_total_simple_result;

	}
	else if (result_check6 === 'Not_bad' || result_check7 === 'Not_bad') {
		return_total_result = 'Not_bad';
		return return_total_simple_result;
	}
	else if (result_check6 === 'Normal' || result_check7 === 'Normal') {
		return_total_result = 'Normal';
		return return_total_simple_result;
	}

	else if (result_check6 === 'Good' || result_check7 === 'Good') {
		return_total_result = 'Good';
		return return_total_simple_result;
	}
	else {
		return_total_result = 'Excellent';
		return return_total_simple_result;
	}
}

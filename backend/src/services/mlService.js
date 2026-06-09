// ML Service - Call Python ML model for predictions
const { spawn } = require('child_process');
const path = require('path');

const SCRIPT_PATH = path.join(__dirname, '../../ml/predict.py');
const PYTHON_PATH = process.env.PYTHON_PATH || 'python3';
const TIMEOUT_MS = 30000; // 30 seconds

/**
 * Run ML prediction by calling Python script
 * @param {Object} inputData - Input features for prediction
 * @returns {Promise<Object>} Prediction result
 */
const runPrediction = async (inputData) => {
  return new Promise((resolve, reject) => {
    // Quote paths with spaces for Windows shell
    const quotedPythonPath = PYTHON_PATH.includes(' ') ? `"${PYTHON_PATH}"` : PYTHON_PATH;
    const quotedScriptPath = SCRIPT_PATH.includes(' ') ? `"${SCRIPT_PATH}"` : SCRIPT_PATH;

    // Build command string for shell
    const command = `${quotedPythonPath} ${quotedScriptPath}`;

    // Use shell: true with command string
    const proc = spawn(command, [], {
      shell: true,
      windowsHide: true
    });
    let output = '';
    let errorOutput = '';

    // Set timeout
    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error('ML prediction timeout (30s)'));
    }, TIMEOUT_MS);

    // Collect stdout
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Collect stderr
    proc.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Handle process completion
    proc.on('close', (code) => {
      clearTimeout(timer);

      if (code !== 0) {
        return reject(new Error(`Python script exited with code ${code}: ${errorOutput}`));
      }

      try {
        const result = JSON.parse(output);
        if (result.error) {
          return reject(new Error(result.error));
        }
        resolve(result);
      } catch (err) {
        reject(new Error(`Invalid JSON from Python script: ${output}`));
      }
    });

    // Handle process errors
    proc.on('error', (err) => {
      clearTimeout(timer);
      reject(new Error(`Failed to start Python process: ${err.message}`));
    });

    // Send input data to stdin
    proc.stdin.write(JSON.stringify(inputData));
    proc.stdin.end();
  });
};



const prepareMLInput = (behaviorData, gradeData = {}) => {
  // Convert score scale if model trained on 100-scale data
 

  const input = {
    study_hours_per_day:
      behaviorData.study_hours_per_day ?? 0,

    class_attendance_percent:
      behaviorData.class_attendance ?? 0,

    sleep_hours:
      behaviorData.sleep_hours_per_day ?? 0,

    social_media_hours:
      behaviorData.social_media_hours ?? 0,
    
    mental_stress_level:
      behaviorData.mental_stress_level ?? 0,

    screen_time_hours:
      behaviorData.screen_time_hours ?? 0,

    extracurricular_hours_per_week:
      behaviorData.extracurricular_hours_per_week ?? 0,

    exercise_hours_per_week:
      behaviorData.exercise_hours_per_week ?? 0
  };

  console.log('=== ML INPUT DATA ===');
  console.log(JSON.stringify(input, null, 2));

  return input;
};

/**
 * Call Python ML model for GPA prediction
 * @param {Object} behaviorData - Student behavior data
 * @param {Object} gradeData - Student grade data (optional)
 * @returns {Promise<Object>} Prediction result with GPA and risk
 */
const predictGPA = async (behaviorData, gradeData = {}) => {
  try {
    // Prepare input
    const inputData = prepareMLInput(behaviorData, gradeData);

    // Call Python script
    const result = await runPrediction(inputData);

    // Result format:
    // {
    //   predicted_gpa4: 2.85,      // GPA on 4.0 scale (save to DB)
    //   predicted_gpa: 7.12,       // GPA on 10.0 scale (display to user)
    //   risk_label: 'safe',        // safe/warning/danger
    //   feature_importance: {...}  // Feature importance scores
    // }

    return result;
  } catch (error) {
    console.error('ML prediction error:', error);
    throw new Error(`Lỗi khi chạy dự báo ML: ${error.message}`);
  }
};

module.exports = {
  predictGPA,
  runPrediction,
  prepareMLInput
};

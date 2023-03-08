export const areEnvCorrect = async () => {
  let correct = true;
  if (!process.env.NUM) {
    console.log("The number of teams is not defined.");
    correct = false;
    throw new Error("NUM env is missing");
  }
  for (let i = 1; i < Number(process.env.NUM) + 1; i++) {
    if (
      !process.env[`XTB_USER_ID_${i}`] ||
      !process.env[`XTB_USER_PASSWORD_${i}`]
    ) {
      throw new Error(`ENVS for user with id ${i} are missing.`);
    }
  }
};

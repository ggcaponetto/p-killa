// @flow

/**
 * This function says hello.
 * @param name Some name to say hello for.
 * @returns The hello.
 */
// const sayHello = (name: string = "Haz"): string => `Hello, ${name}!`;
const sayHello = name => `Hello, ${name}!`;

console.log(sayHello("giuseppe"));

export default sayHello;

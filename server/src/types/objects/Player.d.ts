export default interface Player {
    clientId: string;
    position: {
        x: number;
        y: number;
    };
    rotation: number;
    move: () => void;
}

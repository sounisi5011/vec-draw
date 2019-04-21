export default interface VNode {
    nodeName: string;
    attributes: { [key: string]: string };
    children: VNode[];
}

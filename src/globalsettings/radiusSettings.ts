export abstract class radiusSettings
{
    constructor(){}

    public static getRadius() : number
    {
        var radius = localStorage.getItem("Radius");
        return parseInt(radius);
    }

    public static setRadius(radius : number) : void
    {
        if(radius)
        {
            localStorage.setItem("Radius",radius.toString());
        }
    }
}
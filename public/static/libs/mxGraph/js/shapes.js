//**********************************************************************************************************************************************************
                    //Arc
                    //**********************************************************************************************************************************************************
                    /**
                     * Extends mxShape.
                     */
                    function mxShapeBasicArc(bounds, fill, stroke, strokewidth) {
                        mxShape.call(this);
                        this.bounds = bounds;
                        this.fill = fill;
                        this.stroke = stroke;
                        this.strokewidth = (strokewidth != null) ? strokewidth : 1;
                        this.startAngle = 0.25;
                        this.endAngle = 0.75;
                    };

                    /**
                     * Extends mxShape.
                     */
                    mxUtils.extend(mxShapeBasicArc, mxActor);

                    mxShapeBasicArc.prototype.customProperties = [
                        { name:'startAngle', dispName:'Start Angle', type:'float', min:0, max:1, defVal:0.3 },
                        { name:'endAngle', dispName:'End Angle', type:'float', min:0, max:1, defVal:0.1 }
                    ];

                    mxShapeBasicArc.prototype.cst = { ARC:'mxgraph.basic.arc' };

                    /**
                     * Function: paintVertexShape
                     *
                     * Paints the vertex shape.
                     */
                    mxShapeBasicArc.prototype.paintVertexShape = function(c, x, y, w, h) {
                        c.translate(x, y);

                        var startAngle = 2 * Math.PI * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'startAngle', this.startAngle))));
                        var endAngle = 2 * Math.PI * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'endAngle', this.endAngle))));
                        var rx = w * 0.5;
                        var ry = h * 0.5;

                        var startX = rx + Math.sin(startAngle) * rx;
                        var startY = ry - Math.cos(startAngle) * ry;
                        var endX = rx + Math.sin(endAngle) * rx;
                        var endY = ry - Math.cos(endAngle) * ry;

                        var angDiff = endAngle - startAngle;

                        if(angDiff < 0){
                            angDiff = angDiff + Math.PI * 2;
                        }

                        var bigArc = 0;

                        if(angDiff > Math.PI){
                            bigArc = 1;
                        }

                        c.begin();
                        c.moveTo(startX, startY);
                        c.arcTo(rx, ry, 0, bigArc, 1, endX, endY);
                        c.stroke();
                    };
                    mxCellRenderer.registerShape(mxShapeBasicArc.prototype.cst.ARC, mxShapeBasicArc);
                    mxShapeBasicArc.prototype.constraints = null;